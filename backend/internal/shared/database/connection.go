package database

import (
	"runtime"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// PoolConfig holds connection pool configuration
type PoolConfig struct {
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	ConnMaxIdleTime time.Duration
}

// DefaultPoolConfig returns optimized default pool settings
func DefaultPoolConfig() PoolConfig {
	// Scale based on CPU cores
	numCPU := runtime.NumCPU()

	return PoolConfig{
		// MaxOpenConns: (CPU cores * 2) + effective_spindle_count
		// For SSD, spindle_count = 1, so formula is: (cores * 2) + 1
		// Capped at 50 to avoid overwhelming PostgreSQL
		MaxOpenConns:    min(numCPU*2+1, 50),

		// Keep 25-50% of max connections idle
		MaxIdleConns:    max(numCPU, 10),

		// Rotate connections every 30 minutes to avoid stale connections
		ConnMaxLifetime: 30 * time.Minute,

		// Close idle connections after 5 minutes
		ConnMaxIdleTime: 5 * time.Minute,
	}
}

// Connect opens a connection to the database with optimized connection pool settings.
func Connect(connStr string) (*sqlx.DB, error) {
	return ConnectWithConfig(connStr, DefaultPoolConfig())
}

// ConnectWithConfig opens a connection with custom pool configuration
func ConnectWithConfig(connStr string, config PoolConfig) (*sqlx.DB, error) {
	db, err := sqlx.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	// 🚀 PERFORMANCE OPTIMIZED CONNECTION POOL
	db.SetMaxOpenConns(config.MaxOpenConns)
	db.SetMaxIdleConns(config.MaxIdleConns)
	db.SetConnMaxLifetime(config.ConnMaxLifetime)
	db.SetConnMaxIdleTime(config.ConnMaxIdleTime)

	return db, nil
}

// Helper functions for Go < 1.21 compatibility
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
