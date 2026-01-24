package monitoring

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/jmoiron/sqlx"
)

// QueryStats represents statistics for a single query
type QueryStats struct {
	QueryID          int64         `db:"queryid" json:"query_id"`
	Query            string        `db:"query" json:"query"`
	Calls            int64         `db:"calls" json:"calls"`
	TotalTime        float64       `db:"total_exec_time" json:"total_time_ms"`
	MeanTime         float64       `db:"mean_exec_time" json:"mean_time_ms"`
	MinTime          float64       `db:"min_exec_time" json:"min_time_ms"`
	MaxTime          float64       `db:"max_exec_time" json:"max_time_ms"`
	Rows             int64         `db:"rows" json:"rows"`
	SharedBlksHit    int64         `db:"shared_blks_hit" json:"shared_blks_hit"`
	SharedBlksRead   int64         `db:"shared_blks_read" json:"shared_blks_read"`
	CacheHitRatio    float64       `json:"cache_hit_ratio"`
}

// SlowQuery represents a slow query log entry
type SlowQuery struct {
	Timestamp   time.Time     `json:"timestamp"`
	Duration    time.Duration `json:"duration_ms"`
	Query       string        `json:"query"`
	Args        []interface{} `json:"args,omitempty"`
	CallerFile  string        `json:"caller_file,omitempty"`
	CallerLine  int           `json:"caller_line,omitempty"`
}

// DatabaseHealth represents overall database health metrics
type DatabaseHealth struct {
	Timestamp           time.Time `json:"timestamp"`
	ActiveConnections   int       `json:"active_connections"`
	IdleConnections     int       `json:"idle_connections"`
	MaxConnections      int       `json:"max_connections"`
	CacheHitRatio       float64   `json:"cache_hit_ratio"`
	IndexHitRatio       float64   `json:"index_hit_ratio"`
	TransactionsPerSec  float64   `json:"transactions_per_sec"`
	DeadTuples          int64     `json:"dead_tuples"`
	TableBloatBytes     int64     `json:"table_bloat_bytes"`
}

// QueryMonitor monitors database query performance
type QueryMonitor struct {
	db              *sqlx.DB
	slowThreshold   time.Duration
	slowQueries     []SlowQuery
	slowQueriesMux  sync.RWMutex
	maxSlowQueries  int
	enabled         bool
}

// NewQueryMonitor creates a new query monitor
func NewQueryMonitor(db *sqlx.DB, slowThreshold time.Duration) *QueryMonitor {
	return &QueryMonitor{
		db:             db,
		slowThreshold:  slowThreshold,
		slowQueries:    make([]SlowQuery, 0, 1000),
		maxSlowQueries: 1000,
		enabled:        true,
	}
}

// SetSlowThreshold sets the threshold for slow query logging
func (m *QueryMonitor) SetSlowThreshold(threshold time.Duration) {
	m.slowThreshold = threshold
}

// Enable enables the query monitor
func (m *QueryMonitor) Enable() {
	m.enabled = true
}

// Disable disables the query monitor
func (m *QueryMonitor) Disable() {
	m.enabled = false
}

// LogSlowQuery logs a slow query
func (m *QueryMonitor) LogSlowQuery(duration time.Duration, query string, args ...interface{}) {
	if !m.enabled || duration < m.slowThreshold {
		return
	}

	m.slowQueriesMux.Lock()
	defer m.slowQueriesMux.Unlock()

	sq := SlowQuery{
		Timestamp: time.Now(),
		Duration:  duration,
		Query:     truncateQuery(query, 500),
		Args:      args,
	}

	m.slowQueries = append(m.slowQueries, sq)

	// Keep only last N slow queries
	if len(m.slowQueries) > m.maxSlowQueries {
		m.slowQueries = m.slowQueries[len(m.slowQueries)-m.maxSlowQueries:]
	}

	// Log to console as well
	log.Printf("[SLOW QUERY] %v: %s", duration, truncateQuery(query, 100))
}

// GetSlowQueries returns recent slow queries
func (m *QueryMonitor) GetSlowQueries(limit int) []SlowQuery {
	m.slowQueriesMux.RLock()
	defer m.slowQueriesMux.RUnlock()

	if limit <= 0 || limit > len(m.slowQueries) {
		limit = len(m.slowQueries)
	}

	// Return most recent first
	result := make([]SlowQuery, limit)
	for i := 0; i < limit; i++ {
		result[i] = m.slowQueries[len(m.slowQueries)-1-i]
	}
	return result
}

// ClearSlowQueries clears the slow query log
func (m *QueryMonitor) ClearSlowQueries() {
	m.slowQueriesMux.Lock()
	defer m.slowQueriesMux.Unlock()
	m.slowQueries = m.slowQueries[:0]
}

// GetTopSlowQueries returns top N slowest queries from pg_stat_statements
func (m *QueryMonitor) GetTopSlowQueries(ctx context.Context, limit int) ([]QueryStats, error) {
	query := `
		SELECT
			queryid,
			query,
			calls,
			total_exec_time,
			mean_exec_time,
			min_exec_time,
			max_exec_time,
			rows,
			shared_blks_hit,
			shared_blks_read
		FROM pg_stat_statements
		WHERE query NOT LIKE '%pg_stat_statements%'
		AND query NOT LIKE '%pg_catalog%'
		ORDER BY mean_exec_time DESC
		LIMIT $1
	`

	var stats []QueryStats
	err := m.db.SelectContext(ctx, &stats, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get query stats: %w", err)
	}

	// Calculate cache hit ratio for each query
	for i := range stats {
		total := stats[i].SharedBlksHit + stats[i].SharedBlksRead
		if total > 0 {
			stats[i].CacheHitRatio = float64(stats[i].SharedBlksHit) / float64(total) * 100
		}
	}

	return stats, nil
}

// GetMostFrequentQueries returns most frequently executed queries
func (m *QueryMonitor) GetMostFrequentQueries(ctx context.Context, limit int) ([]QueryStats, error) {
	query := `
		SELECT
			queryid,
			query,
			calls,
			total_exec_time,
			mean_exec_time,
			min_exec_time,
			max_exec_time,
			rows,
			shared_blks_hit,
			shared_blks_read
		FROM pg_stat_statements
		WHERE query NOT LIKE '%pg_stat_statements%'
		AND query NOT LIKE '%pg_catalog%'
		ORDER BY calls DESC
		LIMIT $1
	`

	var stats []QueryStats
	err := m.db.SelectContext(ctx, &stats, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get query stats: %w", err)
	}

	return stats, nil
}

// GetTotalTimeQueries returns queries with highest total execution time
func (m *QueryMonitor) GetTotalTimeQueries(ctx context.Context, limit int) ([]QueryStats, error) {
	query := `
		SELECT
			queryid,
			query,
			calls,
			total_exec_time,
			mean_exec_time,
			min_exec_time,
			max_exec_time,
			rows,
			shared_blks_hit,
			shared_blks_read
		FROM pg_stat_statements
		WHERE query NOT LIKE '%pg_stat_statements%'
		AND query NOT LIKE '%pg_catalog%'
		ORDER BY total_exec_time DESC
		LIMIT $1
	`

	var stats []QueryStats
	err := m.db.SelectContext(ctx, &stats, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get query stats: %w", err)
	}

	return stats, nil
}

// GetDatabaseHealth returns overall database health metrics
func (m *QueryMonitor) GetDatabaseHealth(ctx context.Context) (*DatabaseHealth, error) {
	health := &DatabaseHealth{
		Timestamp: time.Now(),
	}

	// Connection stats
	err := m.db.GetContext(ctx, &health.ActiveConnections, `
		SELECT count(*) FROM pg_stat_activity WHERE state = 'active'
	`)
	if err != nil {
		return nil, err
	}

	err = m.db.GetContext(ctx, &health.IdleConnections, `
		SELECT count(*) FROM pg_stat_activity WHERE state = 'idle'
	`)
	if err != nil {
		return nil, err
	}

	err = m.db.GetContext(ctx, &health.MaxConnections, `
		SELECT setting::int FROM pg_settings WHERE name = 'max_connections'
	`)
	if err != nil {
		return nil, err
	}

	// Cache hit ratio
	var cacheHit sql.NullFloat64
	err = m.db.GetContext(ctx, &cacheHit, `
		SELECT sum(heap_blks_hit) * 100.0 / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0)
		FROM pg_statio_user_tables
	`)
	if err == nil && cacheHit.Valid {
		health.CacheHitRatio = cacheHit.Float64
	}

	// Index hit ratio
	var indexHit sql.NullFloat64
	err = m.db.GetContext(ctx, &indexHit, `
		SELECT sum(idx_blks_hit) * 100.0 / NULLIF(sum(idx_blks_hit) + sum(idx_blks_read), 0)
		FROM pg_statio_user_indexes
	`)
	if err == nil && indexHit.Valid {
		health.IndexHitRatio = indexHit.Float64
	}

	// Dead tuples
	err = m.db.GetContext(ctx, &health.DeadTuples, `
		SELECT COALESCE(sum(n_dead_tup), 0) FROM pg_stat_user_tables
	`)
	if err != nil {
		health.DeadTuples = 0
	}

	return health, nil
}

// GetTableStats returns statistics for tables
func (m *QueryMonitor) GetTableStats(ctx context.Context) ([]TableStat, error) {
	query := `
		SELECT
			schemaname || '.' || relname as table_name,
			n_live_tup as live_rows,
			n_dead_tup as dead_rows,
			COALESCE(last_vacuum, '1970-01-01'::timestamp) as last_vacuum,
			COALESCE(last_autovacuum, '1970-01-01'::timestamp) as last_autovacuum,
			COALESCE(last_analyze, '1970-01-01'::timestamp) as last_analyze,
			seq_scan,
			idx_scan,
			CASE WHEN seq_scan + idx_scan > 0
				THEN round(100.0 * idx_scan / (seq_scan + idx_scan), 1)
				ELSE 100
			END as index_usage_pct
		FROM pg_stat_user_tables
		ORDER BY n_live_tup DESC
		LIMIT 50
	`

	var stats []TableStat
	err := m.db.SelectContext(ctx, &stats, query)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

// TableStat represents statistics for a table
type TableStat struct {
	TableName      string    `db:"table_name" json:"table_name"`
	LiveRows       int64     `db:"live_rows" json:"live_rows"`
	DeadRows       int64     `db:"dead_rows" json:"dead_rows"`
	LastVacuum     time.Time `db:"last_vacuum" json:"last_vacuum"`
	LastAutovacuum time.Time `db:"last_autovacuum" json:"last_autovacuum"`
	LastAnalyze    time.Time `db:"last_analyze" json:"last_analyze"`
	SeqScan        int64     `db:"seq_scan" json:"seq_scan"`
	IdxScan        int64     `db:"idx_scan" json:"idx_scan"`
	IndexUsagePct  float64   `db:"index_usage_pct" json:"index_usage_pct"`
}

// GetIndexStats returns statistics for indexes
func (m *QueryMonitor) GetIndexStats(ctx context.Context) ([]IndexStat, error) {
	query := `
		SELECT
			schemaname || '.' || indexrelname as index_name,
			schemaname || '.' || relname as table_name,
			idx_scan as scans,
			idx_tup_read as tuples_read,
			idx_tup_fetch as tuples_fetched,
			pg_size_pretty(pg_relation_size(indexrelid)) as size
		FROM pg_stat_user_indexes
		ORDER BY idx_scan DESC
		LIMIT 50
	`

	var stats []IndexStat
	err := m.db.SelectContext(ctx, &stats, query)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

// IndexStat represents statistics for an index
type IndexStat struct {
	IndexName     string `db:"index_name" json:"index_name"`
	TableName     string `db:"table_name" json:"table_name"`
	Scans         int64  `db:"scans" json:"scans"`
	TuplesRead    int64  `db:"tuples_read" json:"tuples_read"`
	TuplesFetched int64  `db:"tuples_fetched" json:"tuples_fetched"`
	Size          string `db:"size" json:"size"`
}

// GetUnusedIndexes returns indexes that haven't been used
func (m *QueryMonitor) GetUnusedIndexes(ctx context.Context) ([]IndexStat, error) {
	query := `
		SELECT
			schemaname || '.' || indexrelname as index_name,
			schemaname || '.' || relname as table_name,
			idx_scan as scans,
			idx_tup_read as tuples_read,
			idx_tup_fetch as tuples_fetched,
			pg_size_pretty(pg_relation_size(indexrelid)) as size
		FROM pg_stat_user_indexes
		WHERE idx_scan = 0
		AND indexrelname NOT LIKE '%pkey%'
		AND indexrelname NOT LIKE '%_key'
		ORDER BY pg_relation_size(indexrelid) DESC
		LIMIT 20
	`

	var stats []IndexStat
	err := m.db.SelectContext(ctx, &stats, query)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

// ResetStats resets pg_stat_statements statistics
func (m *QueryMonitor) ResetStats(ctx context.Context) error {
	_, err := m.db.ExecContext(ctx, "SELECT pg_stat_statements_reset()")
	return err
}

// GenerateReport generates a comprehensive performance report
func (m *QueryMonitor) GenerateReport(ctx context.Context) (*PerformanceReport, error) {
	report := &PerformanceReport{
		GeneratedAt: time.Now(),
	}

	// Get health
	health, err := m.GetDatabaseHealth(ctx)
	if err != nil {
		return nil, err
	}
	report.Health = health

	// Get slow queries
	slowQueries, _ := m.GetTopSlowQueries(ctx, 10)
	report.TopSlowQueries = slowQueries

	// Get frequent queries
	frequentQueries, _ := m.GetMostFrequentQueries(ctx, 10)
	report.MostFrequentQueries = frequentQueries

	// Get table stats
	tableStats, _ := m.GetTableStats(ctx)
	report.TableStats = tableStats

	// Get unused indexes
	unusedIndexes, _ := m.GetUnusedIndexes(ctx)
	report.UnusedIndexes = unusedIndexes

	// Generate recommendations
	report.Recommendations = m.generateRecommendations(report)

	return report, nil
}

// PerformanceReport represents a comprehensive performance report
type PerformanceReport struct {
	GeneratedAt          time.Time        `json:"generated_at"`
	Health               *DatabaseHealth  `json:"health"`
	TopSlowQueries       []QueryStats     `json:"top_slow_queries"`
	MostFrequentQueries  []QueryStats     `json:"most_frequent_queries"`
	TableStats           []TableStat      `json:"table_stats"`
	UnusedIndexes        []IndexStat      `json:"unused_indexes"`
	Recommendations      []string         `json:"recommendations"`
}

func (m *QueryMonitor) generateRecommendations(report *PerformanceReport) []string {
	var recommendations []string

	// Check cache hit ratio
	if report.Health != nil && report.Health.CacheHitRatio < 99 {
		recommendations = append(recommendations,
			fmt.Sprintf("Cache hit ratio is %.1f%%. Consider increasing shared_buffers.", report.Health.CacheHitRatio))
	}

	// Check for tables with low index usage
	for _, table := range report.TableStats {
		if table.IndexUsagePct < 50 && table.SeqScan > 100 {
			recommendations = append(recommendations,
				fmt.Sprintf("Table %s has low index usage (%.1f%%). Consider adding indexes.", table.TableName, table.IndexUsagePct))
		}
	}

	// Check for tables needing vacuum
	for _, table := range report.TableStats {
		if table.DeadRows > 10000 {
			recommendations = append(recommendations,
				fmt.Sprintf("Table %s has %d dead rows. Consider running VACUUM.", table.TableName, table.DeadRows))
		}
	}

	// Check unused indexes
	if len(report.UnusedIndexes) > 5 {
		recommendations = append(recommendations,
			fmt.Sprintf("Found %d unused indexes. Consider removing them to improve write performance.", len(report.UnusedIndexes)))
	}

	// Check slow queries
	for _, q := range report.TopSlowQueries {
		if q.MeanTime > 1000 { // > 1 second
			recommendations = append(recommendations,
				fmt.Sprintf("Query with mean time %.0fms needs optimization: %s", q.MeanTime, truncateQuery(q.Query, 50)))
		}
	}

	if len(recommendations) == 0 {
		recommendations = append(recommendations, "Database performance looks good!")
	}

	return recommendations
}

// PrintReport prints the performance report to console
func (m *QueryMonitor) PrintReport(ctx context.Context) {
	report, err := m.GenerateReport(ctx)
	if err != nil {
		log.Printf("Failed to generate report: %v", err)
		return
	}

	fmt.Println("\n" + strings.Repeat("=", 60))
	fmt.Println("DATABASE PERFORMANCE REPORT")
	fmt.Println(strings.Repeat("=", 60))
	fmt.Printf("Generated: %s\n\n", report.GeneratedAt.Format(time.RFC3339))

	// Health
	fmt.Println("📊 DATABASE HEALTH")
	fmt.Println(strings.Repeat("-", 40))
	if report.Health != nil {
		fmt.Printf("  Connections: %d active, %d idle (max: %d)\n",
			report.Health.ActiveConnections, report.Health.IdleConnections, report.Health.MaxConnections)
		fmt.Printf("  Cache Hit Ratio: %.2f%%\n", report.Health.CacheHitRatio)
		fmt.Printf("  Index Hit Ratio: %.2f%%\n", report.Health.IndexHitRatio)
		fmt.Printf("  Dead Tuples: %d\n", report.Health.DeadTuples)
	}

	// Slow queries
	fmt.Println("\n🐢 TOP SLOW QUERIES (by mean time)")
	fmt.Println(strings.Repeat("-", 40))
	for i, q := range report.TopSlowQueries {
		if i >= 5 {
			break
		}
		fmt.Printf("  %d. %.2fms (calls: %d): %s\n", i+1, q.MeanTime, q.Calls, truncateQuery(q.Query, 60))
	}

	// Recommendations
	fmt.Println("\n💡 RECOMMENDATIONS")
	fmt.Println(strings.Repeat("-", 40))
	for _, rec := range report.Recommendations {
		fmt.Printf("  • %s\n", rec)
	}

	fmt.Println(strings.Repeat("=", 60))
}

func truncateQuery(query string, maxLen int) string {
	// Remove extra whitespace
	query = strings.Join(strings.Fields(query), " ")
	if len(query) > maxLen {
		return query[:maxLen] + "..."
	}
	return query
}
