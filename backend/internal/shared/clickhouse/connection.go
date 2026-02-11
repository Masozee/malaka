package clickhouse

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"go.uber.org/zap"
)

// ClickHouseDB wraps a ClickHouse database connection.
type ClickHouseDB struct {
	conn   *sql.DB
	logger *zap.Logger
}

// Config holds ClickHouse connection configuration.
type Config struct {
	Enabled  bool
	Addr     string
	Database string
	Username string
	Password string
}

// NewClickHouseDB creates a new ClickHouse connection.
// Returns nil, nil if ClickHouse is disabled.
func NewClickHouseDB(cfg *Config, logger *zap.Logger) (*ClickHouseDB, error) {
	if !cfg.Enabled {
		logger.Info("ClickHouse is disabled, analytics will use PostgreSQL fallback")
		return nil, nil
	}

	conn := clickhouse.OpenDB(&clickhouse.Options{
		Addr: []string{cfg.Addr},
		Auth: clickhouse.Auth{
			Database: cfg.Database,
			Username: cfg.Username,
			Password: cfg.Password,
		},
		Settings: clickhouse.Settings{
			"max_execution_time": 60,
		},
		DialTimeout:     5 * time.Second,
		MaxOpenConns:    10,
		MaxIdleConns:    5,
		ConnMaxLifetime: 10 * time.Minute,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := conn.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to connect to ClickHouse at %s: %w", cfg.Addr, err)
	}

	conn.SetMaxOpenConns(10)
	conn.SetMaxIdleConns(5)
	conn.SetConnMaxLifetime(10 * time.Minute)

	return &ClickHouseDB{conn: conn, logger: logger}, nil
}

// DB returns the underlying *sql.DB connection.
func (ch *ClickHouseDB) DB() *sql.DB {
	if ch == nil {
		return nil
	}
	return ch.conn
}

// IsAvailable checks if ClickHouse is reachable.
func (ch *ClickHouseDB) IsAvailable() bool {
	if ch == nil || ch.conn == nil {
		return false
	}
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	return ch.conn.PingContext(ctx) == nil
}

// Close gracefully closes the ClickHouse connection.
func (ch *ClickHouseDB) Close() error {
	if ch != nil && ch.conn != nil {
		return ch.conn.Close()
	}
	return nil
}
