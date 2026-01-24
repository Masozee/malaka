package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func main() {
	// Flags
	dbURL := flag.String("db", "postgres://postgres@localhost:5432/malaka?sslmode=disable", "Database URL")
	command := flag.String("cmd", "report", "Command: report, slow, frequent, tables, indexes, health")
	limit := flag.Int("limit", 10, "Limit results")
	flag.Parse()

	// Connect to database
	db, err := sqlx.Connect("postgres", *dbURL)
	if err != nil {
		fmt.Printf("Failed to connect: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()

	ctx := context.Background()

	switch *command {
	case "report":
		printReport(ctx, db)
	case "slow":
		printSlowQueries(ctx, db, *limit)
	case "frequent":
		printFrequentQueries(ctx, db, *limit)
	case "tables":
		printTableStats(ctx, db, *limit)
	case "indexes":
		printIndexStats(ctx, db, *limit)
	case "unused":
		printUnusedIndexes(ctx, db)
	case "health":
		printHealth(ctx, db)
	default:
		fmt.Printf("Unknown command: %s\n", *command)
		os.Exit(1)
	}
}

func printReport(ctx context.Context, db *sqlx.DB) {
	fmt.Println("\n" + strings.Repeat("=", 70))
	fmt.Println("                    DATABASE PERFORMANCE REPORT")
	fmt.Println(strings.Repeat("=", 70))
	fmt.Printf("Generated: %s\n", time.Now().Format(time.RFC3339))

	printHealth(ctx, db)
	fmt.Println()
	printSlowQueries(ctx, db, 5)
	fmt.Println()
	printTableStats(ctx, db, 10)
	fmt.Println()
	printUnusedIndexes(ctx, db)

	fmt.Println(strings.Repeat("=", 70))
}

func printHealth(ctx context.Context, db *sqlx.DB) {
	fmt.Println("\n📊 DATABASE HEALTH")
	fmt.Println(strings.Repeat("-", 50))

	// Connections
	var active, idle, max int
	db.GetContext(ctx, &active, "SELECT count(*) FROM pg_stat_activity WHERE state = 'active'")
	db.GetContext(ctx, &idle, "SELECT count(*) FROM pg_stat_activity WHERE state = 'idle'")
	db.GetContext(ctx, &max, "SELECT setting::int FROM pg_settings WHERE name = 'max_connections'")
	fmt.Printf("  Connections: %d active, %d idle (max: %d)\n", active, idle, max)

	// Cache hit ratio
	var cacheHit float64
	db.GetContext(ctx, &cacheHit, `
		SELECT COALESCE(sum(heap_blks_hit) * 100.0 / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0), 0)
		FROM pg_statio_user_tables
	`)
	status := "✅"
	if cacheHit < 99 {
		status = "⚠️"
	}
	if cacheHit < 90 {
		status = "❌"
	}
	fmt.Printf("  Cache Hit Ratio: %.2f%% %s\n", cacheHit, status)

	// Index hit ratio
	var indexHit float64
	db.GetContext(ctx, &indexHit, `
		SELECT COALESCE(sum(idx_blks_hit) * 100.0 / NULLIF(sum(idx_blks_hit) + sum(idx_blks_read), 0), 0)
		FROM pg_statio_user_indexes
	`)
	status = "✅"
	if indexHit < 99 {
		status = "⚠️"
	}
	fmt.Printf("  Index Hit Ratio: %.2f%% %s\n", indexHit, status)

	// Dead tuples
	var deadTuples int64
	db.GetContext(ctx, &deadTuples, "SELECT COALESCE(sum(n_dead_tup), 0) FROM pg_stat_user_tables")
	status = "✅"
	if deadTuples > 10000 {
		status = "⚠️"
	}
	fmt.Printf("  Dead Tuples: %d %s\n", deadTuples, status)

	// Database size
	var dbSize string
	db.GetContext(ctx, &dbSize, "SELECT pg_size_pretty(pg_database_size(current_database()))")
	fmt.Printf("  Database Size: %s\n", dbSize)
}

func printSlowQueries(ctx context.Context, db *sqlx.DB, limit int) {
	fmt.Println("\n🐢 TOP SLOW QUERIES (by mean execution time)")
	fmt.Println(strings.Repeat("-", 50))

	type QueryStat struct {
		Query    string  `db:"query"`
		Calls    int64   `db:"calls"`
		MeanTime float64 `db:"mean_exec_time"`
		MaxTime  float64 `db:"max_exec_time"`
	}

	var stats []QueryStat
	err := db.SelectContext(ctx, &stats, `
		SELECT
			query,
			calls,
			mean_exec_time,
			max_exec_time
		FROM pg_stat_statements
		WHERE query NOT LIKE '%pg_stat_statements%'
		AND query NOT LIKE '%pg_catalog%'
		ORDER BY mean_exec_time DESC
		LIMIT $1
	`, limit)

	if err != nil {
		fmt.Printf("  Error: %v (pg_stat_statements may not be enabled)\n", err)
		fmt.Println("  Run: ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';")
		fmt.Println("  Then restart PostgreSQL")
		return
	}

	for i, q := range stats {
		query := strings.Join(strings.Fields(q.Query), " ")
		if len(query) > 60 {
			query = query[:60] + "..."
		}
		status := ""
		if q.MeanTime > 1000 {
			status = " ❌"
		} else if q.MeanTime > 100 {
			status = " ⚠️"
		}
		fmt.Printf("  %d. %.2fms (max: %.2fms, calls: %d)%s\n", i+1, q.MeanTime, q.MaxTime, q.Calls, status)
		fmt.Printf("     %s\n", query)
	}
}

func printFrequentQueries(ctx context.Context, db *sqlx.DB, limit int) {
	fmt.Println("\n🔥 MOST FREQUENT QUERIES")
	fmt.Println(strings.Repeat("-", 50))

	type QueryStat struct {
		Query     string  `db:"query"`
		Calls     int64   `db:"calls"`
		TotalTime float64 `db:"total_exec_time"`
	}

	var stats []QueryStat
	err := db.SelectContext(ctx, &stats, `
		SELECT
			query,
			calls,
			total_exec_time
		FROM pg_stat_statements
		WHERE query NOT LIKE '%pg_stat_statements%'
		ORDER BY calls DESC
		LIMIT $1
	`, limit)

	if err != nil {
		fmt.Printf("  Error: %v\n", err)
		return
	}

	for i, q := range stats {
		query := strings.Join(strings.Fields(q.Query), " ")
		if len(query) > 60 {
			query = query[:60] + "..."
		}
		fmt.Printf("  %d. %d calls (total: %.2fms)\n", i+1, q.Calls, q.TotalTime)
		fmt.Printf("     %s\n", query)
	}
}

func printTableStats(ctx context.Context, db *sqlx.DB, limit int) {
	fmt.Println("\n📋 TABLE STATISTICS")
	fmt.Println(strings.Repeat("-", 50))

	type TableStat struct {
		TableName     string  `db:"table_name"`
		LiveRows      int64   `db:"live_rows"`
		DeadRows      int64   `db:"dead_rows"`
		SeqScan       int64   `db:"seq_scan"`
		IdxScan       int64   `db:"idx_scan"`
		IndexUsagePct float64 `db:"index_usage_pct"`
	}

	var stats []TableStat
	err := db.SelectContext(ctx, &stats, `
		SELECT
			schemaname || '.' || relname as table_name,
			n_live_tup as live_rows,
			n_dead_tup as dead_rows,
			seq_scan,
			idx_scan,
			CASE WHEN seq_scan + idx_scan > 0
				THEN round(100.0 * idx_scan / (seq_scan + idx_scan), 1)
				ELSE 100
			END as index_usage_pct
		FROM pg_stat_user_tables
		WHERE n_live_tup > 0 OR seq_scan > 0
		ORDER BY seq_scan DESC
		LIMIT $1
	`, limit)

	if err != nil {
		fmt.Printf("  Error: %v\n", err)
		return
	}

	fmt.Printf("  %-40s %10s %10s %8s\n", "Table", "Rows", "Dead", "Idx%")
	fmt.Printf("  %s\n", strings.Repeat("-", 70))
	for _, t := range stats {
		status := ""
		if t.IndexUsagePct < 50 && t.SeqScan > 10 {
			status = " ⚠️"
		}
		fmt.Printf("  %-40s %10d %10d %7.1f%%%s\n", t.TableName, t.LiveRows, t.DeadRows, t.IndexUsagePct, status)
	}
}

func printIndexStats(ctx context.Context, db *sqlx.DB, limit int) {
	fmt.Println("\n📑 INDEX STATISTICS")
	fmt.Println(strings.Repeat("-", 50))

	type IndexStat struct {
		IndexName string `db:"index_name"`
		TableName string `db:"table_name"`
		Scans     int64  `db:"scans"`
		Size      string `db:"size"`
	}

	var stats []IndexStat
	err := db.SelectContext(ctx, &stats, `
		SELECT
			schemaname || '.' || indexrelname as index_name,
			schemaname || '.' || relname as table_name,
			idx_scan as scans,
			pg_size_pretty(pg_relation_size(indexrelid)) as size
		FROM pg_stat_user_indexes
		ORDER BY idx_scan DESC
		LIMIT $1
	`, limit)

	if err != nil {
		fmt.Printf("  Error: %v\n", err)
		return
	}

	fmt.Printf("  %-50s %10s %10s\n", "Index", "Scans", "Size")
	fmt.Printf("  %s\n", strings.Repeat("-", 72))
	for _, idx := range stats {
		fmt.Printf("  %-50s %10d %10s\n", idx.IndexName, idx.Scans, idx.Size)
	}
}

func printUnusedIndexes(ctx context.Context, db *sqlx.DB) {
	fmt.Println("\n🗑️  UNUSED INDEXES (candidates for removal)")
	fmt.Println(strings.Repeat("-", 50))

	type IndexStat struct {
		IndexName string `db:"index_name"`
		TableName string `db:"table_name"`
		Size      string `db:"size"`
	}

	var stats []IndexStat
	err := db.SelectContext(ctx, &stats, `
		SELECT
			schemaname || '.' || indexrelname as index_name,
			schemaname || '.' || relname as table_name,
			pg_size_pretty(pg_relation_size(indexrelid)) as size
		FROM pg_stat_user_indexes
		WHERE idx_scan = 0
		AND indexrelname NOT LIKE '%pkey%'
		AND indexrelname NOT LIKE '%_key'
		ORDER BY pg_relation_size(indexrelid) DESC
		LIMIT 10
	`)

	if err != nil {
		fmt.Printf("  Error: %v\n", err)
		return
	}

	if len(stats) == 0 {
		fmt.Println("  No unused indexes found ✅")
		return
	}

	fmt.Printf("  %-50s %10s\n", "Index", "Size")
	fmt.Printf("  %s\n", strings.Repeat("-", 62))
	for _, idx := range stats {
		fmt.Printf("  %-50s %10s\n", idx.IndexName, idx.Size)
	}
	fmt.Println("\n  Note: New indexes may have 0 scans. Check after some usage.")
}
