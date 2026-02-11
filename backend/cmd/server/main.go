package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"sync"
	"syscall"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
	analytics_services "malaka/internal/modules/analytics/domain/services"
	"malaka/internal/config"
	"malaka/internal/server/container"
	httpserver "malaka/internal/server/http"
	"malaka/internal/shared/cache"
	chdb "malaka/internal/shared/clickhouse"
	"malaka/internal/shared/database"
	"malaka/internal/shared/logger"
)

// Production configuration constants
const (
	// Timeouts
	shutdownTimeout    = 30 * time.Second
	cacheWarmupTimeout = 30 * time.Second
	readTimeout        = 15 * time.Second
	writeTimeout       = 0 // Disabled for WebSocket long-lived connections
	idleTimeout        = 120 * time.Second

	// Worker pool settings
	maxWorkers = 100
)

// WorkerPool manages concurrent background tasks
type WorkerPool struct {
	workers   int
	taskQueue chan func()
	wg        sync.WaitGroup
	quit      chan struct{}
}

// NewWorkerPool creates a new worker pool with the specified number of workers
func NewWorkerPool(workers int) *WorkerPool {
	if workers <= 0 {
		workers = runtime.NumCPU() * 2
	}
	if workers > maxWorkers {
		workers = maxWorkers
	}

	pool := &WorkerPool{
		workers:   workers,
		taskQueue: make(chan func(), workers*10),
		quit:      make(chan struct{}),
	}

	return pool
}

// Start initializes the worker pool goroutines
func (wp *WorkerPool) Start() {
	for i := 0; i < wp.workers; i++ {
		wp.wg.Add(1)
		go wp.worker(i)
	}
}

// worker is the main loop for each worker goroutine
func (wp *WorkerPool) worker(id int) {
	defer wp.wg.Done()
	for {
		select {
		case task, ok := <-wp.taskQueue:
			if !ok {
				return
			}
			task()
		case <-wp.quit:
			return
		}
	}
}

// Submit adds a task to the worker pool queue
func (wp *WorkerPool) Submit(task func()) bool {
	select {
	case wp.taskQueue <- task:
		return true
	default:
		// Queue is full
		return false
	}
}

// Stop gracefully shuts down the worker pool
func (wp *WorkerPool) Stop() {
	close(wp.quit)
	close(wp.taskQueue)
	wp.wg.Wait()
}

func main() {
	// Set GOMAXPROCS to use all available CPU cores
	runtime.GOMAXPROCS(runtime.NumCPU())

	// Load config first
	cfg, err := config.LoadConfig(".")
	if err != nil {
		basicLogger, _ := zap.NewProduction()
		basicLogger.Fatal("cannot load config", zap.Error(err))
	}

	// Determine if we're in production mode
	isProduction := cfg.AppEnv == "production"

	// Initialize structured logger with appropriate level
	var zapLogger *zap.Logger
	if isProduction {
		zapLogger, err = zap.NewProduction()
	} else {
		zapLogger, err = logger.NewLoggerWithLokiIfConfigured()
	}
	if err != nil {
		basicLogger, _ := zap.NewProduction()
		basicLogger.Fatal("cannot create logger", zap.Error(err))
	}
	defer zapLogger.Sync()

	zapLogger.Info("Starting Malaka ERP server",
		zap.String("address", cfg.ServerAddress),
		zap.String("environment", cfg.AppEnv),
		zap.Int("gomaxprocs", runtime.GOMAXPROCS(0)),
		zap.Int("num_cpu", runtime.NumCPU()),
	)

	// Initialize worker pool for background tasks
	workerPool := NewWorkerPool(runtime.NumCPU() * 2)
	workerPool.Start()
	zapLogger.Info("Worker pool started", zap.Int("workers", workerPool.workers))

	// Connect to database with production settings
	conn, err := database.Connect(cfg.DBSource)
	if err != nil {
		zapLogger.Fatal("cannot connect to db", zap.Error(err))
	}
	defer func(conn *sqlx.DB) {
		if err := conn.Close(); err != nil {
			zapLogger.Error("error closing database connection", zap.Error(err))
		}
	}(conn)

	// Configure connection pool for production
	conn.SetMaxOpenConns(25)
	conn.SetMaxIdleConns(10)
	conn.SetConnMaxLifetime(5 * time.Minute)
	conn.SetConnMaxIdleTime(2 * time.Minute)

	zapLogger.Info("Database connection established",
		zap.Int("max_open_conns", 25),
		zap.Int("max_idle_conns", 10),
	)

	// Initialize GORM with production-optimized settings
	gormConfig := &gorm.Config{
		PrepareStmt:                              true,  // Cache prepared statements
		SkipDefaultTransaction:                   true,  // Skip default transaction for better performance
		DisableForeignKeyConstraintWhenMigrating: false, // Keep FK constraints
	}

	// Set GORM log level based on environment
	if isProduction {
		gormConfig.Logger = gormlogger.Default.LogMode(gormlogger.Silent)
	} else {
		gormConfig.Logger = gormlogger.Default.LogMode(gormlogger.Warn)
	}

	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: conn.DB,
	}), gormConfig)
	if err != nil {
		zapLogger.Fatal("cannot connect to gorm db", zap.Error(err))
	}

	// Initialize Redis cache with connection pooling
	redisCache := cache.NewRedisCache(cfg.RedisAddr, cfg.RedisPassword, cfg.RedisDB)
	zapLogger.Info("Redis cache initialized", zap.String("address", cfg.RedisAddr))

	// Initialize ClickHouse analytical database (optional)
	var clickhouseDB *chdb.ClickHouseDB
	if cfg.ClickHouseEnabled {
		chConfig := &chdb.Config{
			Enabled:  cfg.ClickHouseEnabled,
			Addr:     cfg.ClickHouseAddr,
			Database: cfg.ClickHouseDatabase,
			Username: cfg.ClickHouseUsername,
			Password: cfg.ClickHousePassword,
		}
		var chErr error
		clickhouseDB, chErr = chdb.NewClickHouseDB(chConfig, zapLogger)
		if chErr != nil {
			zapLogger.Warn("ClickHouse initialization failed, analytics will fall back to PostgreSQL",
				zap.Error(chErr))
		} else if clickhouseDB != nil {
			zapLogger.Info("ClickHouse connection established",
				zap.String("address", cfg.ClickHouseAddr),
				zap.String("database", cfg.ClickHouseDatabase))

			// Run ClickHouse schema migrations
			if migErr := chdb.RunMigrations(clickhouseDB, zapLogger); migErr != nil {
				zapLogger.Warn("ClickHouse schema migration failed", zap.Error(migErr))
			}
		}
	} else {
		zapLogger.Info("ClickHouse is disabled, analytics will use PostgreSQL fallback")
	}

	// Create application container
	appContainer := container.NewContainer(&cfg, zapLogger, conn.DB, gormDB, redisCache)

	// Set optional ClickHouse connection
	if clickhouseDB != nil {
		appContainer.ClickHouseDB = clickhouseDB
		zapLogger.Info("ClickHouse registered in application container")
	}

	// Initialize analytics query service (works with or without ClickHouse)
	analyticsQueryService := analytics_services.NewAnalyticsQueryService(clickhouseDB, sqlx.NewDb(conn.DB, "postgres"), zapLogger)
	appContainer.AnalyticsQueryService = analyticsQueryService
	zapLogger.Info("Analytics query service initialized",
		zap.Bool("clickhouse_enabled", clickhouseDB != nil))

	// Create HTTP server with Gin router
	ginServer, err := httpserver.NewServer(&cfg, zapLogger, appContainer)
	if err != nil {
		zapLogger.Fatal("cannot create server", zap.Error(err))
	}

	// Wrap Gin with production-ready http.Server
	httpServer := &http.Server{
		Addr:         cfg.ServerAddress,
		Handler:      ginServer.GetRouter(),
		ReadTimeout:  readTimeout,
		WriteTimeout: writeTimeout,
		IdleTimeout:  idleTimeout,
	}

	// Warm caches in background using worker pool
	cacheWarmupDone := make(chan struct{})
	workerPool.Submit(func() {
		defer close(cacheWarmupDone)
		ctx, cancel := context.WithTimeout(context.Background(), cacheWarmupTimeout)
		defer cancel()

		zapLogger.Info("Warming caches on startup...")
		if err := appContainer.WarmCaches(ctx); err != nil {
			zapLogger.Warn("Failed to warm caches", zap.Error(err))
		} else {
			zapLogger.Info("Cache warming completed successfully")
		}
	})

	// Channel to track server errors
	serverErrors := make(chan error, 1)

	// Start server in a goroutine
	go func() {
		zapLogger.Info("Starting HTTP server",
			zap.String("address", cfg.ServerAddress),
			zap.Duration("read_timeout", readTimeout),
			zap.Duration("write_timeout", writeTimeout),
			zap.Duration("idle_timeout", idleTimeout),
		)

		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			serverErrors <- err
		}
	}()

	// Setup signal handling for graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM, syscall.SIGHUP)

	// Wait for shutdown signal or server error
	select {
	case err := <-serverErrors:
		zapLogger.Fatal("Server error", zap.Error(err))
	case sig := <-quit:
		zapLogger.Info("Received shutdown signal", zap.String("signal", sig.String()))
	}

	// Graceful shutdown
	zapLogger.Info("Starting graceful shutdown...", zap.Duration("timeout", shutdownTimeout))

	ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	// Shutdown HTTP server
	if err := httpServer.Shutdown(ctx); err != nil {
		zapLogger.Error("Error during HTTP server shutdown", zap.Error(err))
	} else {
		zapLogger.Info("HTTP server stopped gracefully")
	}

	// Stop worker pool
	workerPool.Stop()
	zapLogger.Info("Worker pool stopped")

	// Wait for cache warmup to complete if still running
	select {
	case <-cacheWarmupDone:
	case <-time.After(5 * time.Second):
		zapLogger.Warn("Cache warmup did not complete in time")
	}

	// Close ClickHouse connection
	if clickhouseDB != nil {
		if err := clickhouseDB.Close(); err != nil {
			zapLogger.Error("Error closing ClickHouse connection", zap.Error(err))
		} else {
			zapLogger.Info("ClickHouse connection closed")
		}
	}

	// Close database connection (handled by defer, but log it)
	zapLogger.Info("Closing database connections...")

	zapLogger.Info("Server shutdown complete")
	os.Exit(0)
}