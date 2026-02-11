package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"go.uber.org/zap"

	chdb "malaka/internal/shared/clickhouse"

	analyticsSync "malaka/internal/modules/analytics/infrastructure/sync"
)

func main() {
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	// Connect to PostgreSQL
	pgConn, err := sql.Open("postgres", "postgres://postgres:B6585esp__@localhost:5432/malaka?sslmode=disable")
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	defer pgConn.Close()
	if err := pgConn.Ping(); err != nil {
		log.Fatalf("Failed to ping PostgreSQL: %v", err)
	}
	fmt.Println("✓ PostgreSQL connected")

	pgDB := sqlx.NewDb(pgConn, "postgres")

	// Connect to ClickHouse
	clickhouseDB, err := chdb.NewClickHouseDB(&chdb.Config{
		Enabled:  true,
		Addr:     "localhost:9000",
		Database: "malaka_analytics",
		Username: "default",
		Password: "",
	}, logger)
	if err != nil {
		log.Fatalf("Failed to connect to ClickHouse: %v", err)
	}
	defer clickhouseDB.Close()
	fmt.Println("✓ ClickHouse connected")

	chSqlDB := clickhouseDB.DB()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	// Drop old fact tables with wrong schemas and recreate
	fmt.Println("\n=== Dropping old tables to reset schemas ===")
	dropTables := []string{
		"sales_fact", "procurement_fact", "inventory_movement_fact",
		"financial_transaction_fact", "attendance_fact",
		"dim_customer", "dim_supplier", "dim_article", "dim_warehouse", "dim_employee",
		"sync_watermarks",
	}
	for _, t := range dropTables {
		if _, err := chSqlDB.ExecContext(ctx, fmt.Sprintf("DROP TABLE IF EXISTS %s", t)); err != nil {
			fmt.Printf("  Warning: could not drop %s: %v\n", t, err)
		} else {
			fmt.Printf("  Dropped %s\n", t)
		}
	}

	// Re-run migrations to recreate with correct schemas
	fmt.Println("\n=== Running migrations ===")
	if err := chdb.RunMigrations(clickhouseDB, logger); err != nil {
		log.Fatalf("Failed to run ClickHouse migrations: %v", err)
	}
	fmt.Println("✓ Migrations completed")

	// Run the full sync
	syncSvc := analyticsSync.NewBatchSyncService(pgDB, chSqlDB, logger)
	fmt.Println("\n=== Starting Full Sync ===")
	start := time.Now()

	if err := syncSvc.RunFullSync(ctx); err != nil {
		log.Fatalf("Sync failed: %v", err)
	}

	fmt.Printf("\n=== Sync completed in %v ===\n", time.Since(start))

	// Verify counts
	tables := []string{
		"dim_date", "dim_customer", "dim_supplier", "dim_article", "dim_warehouse", "dim_employee",
		"sales_fact", "procurement_fact", "inventory_movement_fact", "financial_transaction_fact", "attendance_fact",
	}
	fmt.Println("\n=== ClickHouse Row Counts ===")
	for _, t := range tables {
		var count uint64
		if err := chSqlDB.QueryRowContext(ctx, fmt.Sprintf("SELECT count() FROM %s", t)).Scan(&count); err != nil {
			fmt.Printf("  %-35s ERROR: %v\n", t, err)
		} else {
			fmt.Printf("  %-35s %d rows\n", t, count)
		}
	}
}
