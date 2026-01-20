package main

import (
	"context"
	"os"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"malaka/internal/config"
	"malaka/internal/server/container"
	"malaka/internal/server/http"
	"malaka/internal/shared/cache"
	"malaka/internal/shared/database"
	"malaka/internal/shared/logger"
)

func main() {
	// Load config first
	cfg, err := config.LoadConfig(".")
	if err != nil {
		// Use a basic zap logger for early errors before full logger is initialized
		basicLogger, _ := zap.NewProduction()
		basicLogger.Fatal("cannot load config", zap.Error(err))
	}

	// Initialize structured logger
	zapLogger, err := logger.NewLoggerWithLokiIfConfigured()
	if err != nil {
		basicLogger, _ := zap.NewProduction()
		basicLogger.Fatal("cannot create logger", zap.Error(err))
	}
	defer zapLogger.Sync()

	zapLogger.Info("Starting Malaka ERP server",
		zap.String("address", cfg.ServerAddress),
		zap.String("environment", cfg.AppEnv),
	)

	// Connect to database
	conn, err := database.Connect(cfg.DBSource)
	if err != nil {
		zapLogger.Fatal("cannot connect to db", zap.Error(err))
	}
	defer func(conn *sqlx.DB) {
		if err := conn.Close(); err != nil {
			zapLogger.Error("error closing database connection", zap.Error(err))
		}
	}(conn)

	zapLogger.Info("Database connection established")

	// Initialize GORM
	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: conn.DB,
	}), &gorm.Config{})
	if err != nil {
		zapLogger.Fatal("cannot connect to gorm db", zap.Error(err))
	}

	// Initialize Redis cache
	redisCache := cache.NewRedisCache(cfg.RedisAddr, cfg.RedisPassword, cfg.RedisDB)
	zapLogger.Info("Redis cache initialized", zap.String("address", cfg.RedisAddr))

	// Create application container
	appContainer := container.NewContainer(&cfg, zapLogger, conn.DB, gormDB, redisCache)

	// Create HTTP server
	server, err := http.NewServer(&cfg, zapLogger, appContainer)
	if err != nil {
		zapLogger.Fatal("cannot create server", zap.Error(err))
	}

	// Warm caches on startup for better performance
	zapLogger.Info("Warming caches on startup...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := appContainer.WarmCaches(ctx); err != nil {
		zapLogger.Warn("Failed to warm caches", zap.Error(err))
		// Continue startup even if cache warming fails
	} else {
		zapLogger.Info("Cache warming completed successfully")
	}

	// Start server
	zapLogger.Info("Starting HTTP server", zap.String("address", cfg.ServerAddress))
	if err := server.Start(cfg.ServerAddress); err != nil {
		zapLogger.Fatal("cannot start server", zap.Error(err))
		os.Exit(1)
	}
}