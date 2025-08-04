package database

import (
	"time"
	
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// Connect opens a connection to the database with optimized connection pool settings.
func Connect(connStr string) (*sqlx.DB, error) {
	db, err := sqlx.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	// 🚀 CRITICAL PERFORMANCE OPTIMIZATIONS
	// Configure connection pool for optimal performance
	db.SetMaxOpenConns(25)                 // Limit concurrent connections
	db.SetMaxIdleConns(5)                  // Keep some connections warm
	db.SetConnMaxLifetime(5 * time.Minute) // Rotate connections regularly
	db.SetConnMaxIdleTime(1 * time.Minute) // Close idle connections

	return db, nil
}
