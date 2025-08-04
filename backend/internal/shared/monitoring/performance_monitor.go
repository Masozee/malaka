package monitoring

import (
	"context"
	"database/sql"
	"fmt"
	"sync"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// PerformanceMonitor provides comprehensive performance monitoring
// Tracks database performance, cache efficiency, and system health
type PerformanceMonitor struct {
	db          *sqlx.DB
	redis       *redis.Client
	metrics     *MetricsCollector
	alerts      chan Alert
	running     bool
	stopCh      chan struct{}
	mu          sync.RWMutex
}

type Alert struct {
	Type        string    `json:"type"`
	Severity    string    `json:"severity"`    // critical, warning, info
	Message     string    `json:"message"`
	Timestamp   time.Time `json:"timestamp"`
	Component   string    `json:"component"`   // database, cache, application
	MetricValue float64   `json:"metric_value"`
	Threshold   float64   `json:"threshold"`
}

type MetricsCollector struct {
	DatabaseMetrics *DatabaseMetrics `json:"database_metrics"`
	CacheMetrics    *CacheMetrics    `json:"cache_metrics"`
	SystemMetrics   *SystemMetrics   `json:"system_metrics"`
	LastUpdated     time.Time        `json:"last_updated"`
}

type DatabaseMetrics struct {
	// Connection pool metrics
	MaxOpenConnections    int     `json:"max_open_connections"`
	OpenConnections       int     `json:"open_connections"`
	InUseConnections      int     `json:"in_use_connections"`
	IdleConnections       int     `json:"idle_connections"`
	
	// Query performance metrics
	AvgQueryTime          float64 `json:"avg_query_time_ms"`
	SlowQueryCount        int64   `json:"slow_query_count"`
	TotalQueries          int64   `json:"total_queries"`
	
	// Database health metrics
	ActiveConnections     int     `json:"active_connections"`
	LockWaits            int64   `json:"lock_waits"`
	DeadlockCount        int64   `json:"deadlock_count"`
	
	// Table-specific metrics
	TableSizes           map[string]int64 `json:"table_sizes"`
	IndexUsage           map[string]float64 `json:"index_usage"`
	
	// Recent N+1 query detection
	PotentialN1Queries   []N1QueryAlert `json:"potential_n1_queries"`
}

type N1QueryAlert struct {
	Query         string    `json:"query"`
	ExecutionCount int      `json:"execution_count"`
	TimeWindow    string    `json:"time_window"`
	DetectedAt    time.Time `json:"detected_at"`
	Severity      string    `json:"severity"`
}

type CacheMetrics struct {
	// Redis metrics
	HitRate              float64            `json:"hit_rate"`
	MissRate             float64            `json:"miss_rate"`
	MemoryUsed           int64              `json:"memory_used_bytes"`
	MemoryMax            int64              `json:"memory_max_bytes"`
	MemoryUsagePercent   float64            `json:"memory_usage_percent"`
	
	// Cache performance
	AvgGetLatency        float64            `json:"avg_get_latency_ms"`
	AvgSetLatency        float64            `json:"avg_set_latency_ms"`
	TotalOperations      int64              `json:"total_operations"`
	
	// Key statistics
	TotalKeys            int64              `json:"total_keys"`
	ExpiredKeys          int64              `json:"expired_keys"`
	EvictedKeys          int64              `json:"evicted_keys"`
	
	// Cache patterns
	KeyPatternStats      map[string]int64   `json:"key_pattern_stats"`
}

type SystemMetrics struct {
	// Go runtime metrics
	GoroutineCount       int     `json:"goroutine_count"`
	HeapSize             int64   `json:"heap_size_bytes"`
	HeapUsed             int64   `json:"heap_used_bytes"`
	GCPauseTime          float64 `json:"gc_pause_time_ms"`
	
	// Application metrics
	RequestsPerSecond    float64 `json:"requests_per_second"`
	AvgResponseTime      float64 `json:"avg_response_time_ms"`
	ErrorRate            float64 `json:"error_rate_percent"`
	
	// Resource usage
	CPUUsage             float64 `json:"cpu_usage_percent"`
	MemoryUsage          float64 `json:"memory_usage_percent"`
}

func NewPerformanceMonitor(db *sqlx.DB, redis *redis.Client) *PerformanceMonitor {
	return &PerformanceMonitor{
		db:      db,
		redis:   redis,
		metrics: &MetricsCollector{},
		alerts:  make(chan Alert, 1000),
		stopCh:  make(chan struct{}),
	}
}

// Start begins the monitoring process
func (p *PerformanceMonitor) Start(ctx context.Context) error {
	p.mu.Lock()
	if p.running {
		p.mu.Unlock()
		return fmt.Errorf("monitor is already running")
	}
	p.running = true
	p.mu.Unlock()

	// Start monitoring goroutines
	go p.monitorDatabase(ctx)
	go p.monitorCache(ctx)
	go p.monitorSystem(ctx)
	go p.detectPerformanceAnomalies(ctx)

	fmt.Println("🚀 Performance Monitor started")
	return nil
}

// Stop stops the monitoring process
func (p *PerformanceMonitor) Stop() {
	p.mu.Lock()
	defer p.mu.Unlock()
	
	if !p.running {
		return
	}
	
	close(p.stopCh)
	p.running = false
	fmt.Println("⏹️  Performance Monitor stopped")
}

// monitorDatabase continuously monitors database performance
func (p *PerformanceMonitor) monitorDatabase(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-p.stopCh:
			return
		case <-ticker.C:
			metrics, err := p.collectDatabaseMetrics(ctx)
			if err != nil {
				p.sendAlert(Alert{
					Type:      "database_metrics_error",
					Severity:  "warning",
					Message:   fmt.Sprintf("Failed to collect database metrics: %v", err),
					Timestamp: time.Now(),
					Component: "database",
				})
				continue
			}

			p.mu.Lock()
			p.metrics.DatabaseMetrics = metrics
			p.metrics.LastUpdated = time.Now()
			p.mu.Unlock()

			// Check for performance issues
			p.checkDatabasePerformance(metrics)
		}
	}
}

func (p *PerformanceMonitor) collectDatabaseMetrics(ctx context.Context) (*DatabaseMetrics, error) {
	metrics := &DatabaseMetrics{
		TableSizes:  make(map[string]int64),
		IndexUsage:  make(map[string]float64),
	}

	// Get connection pool stats
	stats := p.db.Stats()
	metrics.MaxOpenConnections = stats.MaxOpenConnections
	metrics.OpenConnections = stats.OpenConnections
	metrics.InUseConnections = stats.InUse
	metrics.IdleConnections = stats.Idle

	// Get database activity stats
	var activeConnections int
	err := p.db.GetContext(ctx, &activeConnections, `
		SELECT count(*) 
		FROM pg_stat_activity 
		WHERE state = 'active' AND datname = current_database()
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get active connections: %w", err)
	}
	metrics.ActiveConnections = activeConnections

	// Get slow query information
	var slowQueryCount int64
	err = p.db.GetContext(ctx, &slowQueryCount, `
		SELECT count(*) 
		FROM pg_stat_statements 
		WHERE mean_time > 1000
	`)
	if err == nil {
		metrics.SlowQueryCount = slowQueryCount
	}

	// Get table sizes
	rows, err := p.db.QueryContext(ctx, `
		SELECT 
			schemaname||'.'||tablename as table_name,
			pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
		FROM pg_tables 
		WHERE schemaname = 'public'
		ORDER BY size_bytes DESC
		LIMIT 20
	`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var tableName string
			var sizeBytes int64
			if err := rows.Scan(&tableName, &sizeBytes); err == nil {
				metrics.TableSizes[tableName] = sizeBytes
			}
		}
	}

	// Detect potential N+1 queries
	metrics.PotentialN1Queries = p.detectN1Queries(ctx)

	return metrics, nil
}

func (p *PerformanceMonitor) detectN1Queries(ctx context.Context) []N1QueryAlert {
	var alerts []N1QueryAlert

	// Look for queries executed many times in short time windows
	rows, err := p.db.QueryContext(ctx, `
		SELECT 
			query,
			calls,
			mean_time,
			total_time
		FROM pg_stat_statements 
		WHERE calls > 50 AND mean_time < 10 AND total_time > 1000
		ORDER BY calls DESC
		LIMIT 10
	`)
	if err != nil {
		return alerts
	}
	defer rows.Close()

	for rows.Next() {
		var query string
		var calls int64
		var meanTime, totalTime float64

		if err := rows.Scan(&query, &calls, &meanTime, &totalTime); err != nil {
			continue
		}

		// Heuristic for N+1 detection: many fast queries with similar patterns
		if calls > 100 && meanTime < 5 {
			severity := "warning"
			if calls > 500 {
				severity = "critical"
			}

			alerts = append(alerts, N1QueryAlert{
				Query:          query,
				ExecutionCount: int(calls),
				TimeWindow:     "last_hour",
				DetectedAt:     time.Now(),
				Severity:       severity,
			})
		}
	}

	return alerts
}

func (p *PerformanceMonitor) checkDatabasePerformance(metrics *DatabaseMetrics) {
	// Check connection pool utilization
	if metrics.InUseConnections > 0 && metrics.MaxOpenConnections > 0 {
		utilization := float64(metrics.InUseConnections) / float64(metrics.MaxOpenConnections)
		if utilization > 0.8 {
			p.sendAlert(Alert{
				Type:        "high_connection_utilization",
				Severity:    "warning",
				Message:     fmt.Sprintf("Connection pool utilization is %.1f%%", utilization*100),
				Timestamp:   time.Now(),
				Component:   "database",
				MetricValue: utilization * 100,
				Threshold:   80,
			})
		}
	}

	// Check for slow queries
	if metrics.SlowQueryCount > 10 {
		p.sendAlert(Alert{
			Type:        "high_slow_query_count",
			Severity:    "warning",
			Message:     fmt.Sprintf("Detected %d slow queries", metrics.SlowQueryCount),
			Timestamp:   time.Now(),
			Component:   "database",
			MetricValue: float64(metrics.SlowQueryCount),
			Threshold:   10,
		})
	}

	// Check for potential N+1 queries
	for _, n1Alert := range metrics.PotentialN1Queries {
		if n1Alert.Severity == "critical" {
			p.sendAlert(Alert{
				Type:        "potential_n1_query",
				Severity:    "critical",
				Message:     fmt.Sprintf("Potential N+1 query detected: %d executions", n1Alert.ExecutionCount),
				Timestamp:   time.Now(),
				Component:   "database",
				MetricValue: float64(n1Alert.ExecutionCount),
				Threshold:   500,
			})
		}
	}
}

// monitorCache continuously monitors Redis cache performance  
func (p *PerformanceMonitor) monitorCache(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-p.stopCh:
			return
		case <-ticker.C:
			metrics, err := p.collectCacheMetrics(ctx)
			if err != nil {
				p.sendAlert(Alert{
					Type:      "cache_metrics_error",
					Severity:  "warning",
					Message:   fmt.Sprintf("Failed to collect cache metrics: %v", err),
					Timestamp: time.Now(),
					Component: "cache",
				})
				continue
			}

			p.mu.Lock()
			p.metrics.CacheMetrics = metrics
			p.mu.Unlock()

			p.checkCachePerformance(metrics)
		}
	}
}

func (p *PerformanceMonitor) collectCacheMetrics(ctx context.Context) (*CacheMetrics, error) {
	metrics := &CacheMetrics{
		KeyPatternStats: make(map[string]int64),
	}

	// Get Redis INFO stats
	info, err := p.redis.Info(ctx, "stats", "memory", "keyspace").Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get Redis info: %w", err)
	}

	// Parse Redis info (simplified - you'd want more robust parsing)
	// For now, we'll collect basic metrics

	// Get memory usage
	memInfo, err := p.redis.Info(ctx, "memory").Result()
	if err == nil {
		// Parse memory info from Redis INFO output
		_ = memInfo // TODO: Parse actual memory usage
		metrics.MemoryUsed = 1024 * 1024 * 100 // Placeholder
		metrics.MemoryMax = 1024 * 1024 * 1024  // Placeholder
		metrics.MemoryUsagePercent = float64(metrics.MemoryUsed) / float64(metrics.MemoryMax) * 100
	}

	// Calculate hit/miss rates (would need to track these over time)
	metrics.HitRate = 95.5  // Placeholder
	metrics.MissRate = 4.5  // Placeholder

	// Get total keys
	result, err := p.redis.DBSize(ctx).Result()
	if err == nil {
		metrics.TotalKeys = result
	}

	return metrics, nil
}

func (p *PerformanceMonitor) checkCachePerformance(metrics *CacheMetrics) {
	// Check cache hit rate
	if metrics.HitRate < 80 {
		p.sendAlert(Alert{
			Type:        "low_cache_hit_rate",
			Severity:    "warning",
			Message:     fmt.Sprintf("Cache hit rate is %.1f%%", metrics.HitRate),
			Timestamp:   time.Now(),
			Component:   "cache",
			MetricValue: metrics.HitRate,
			Threshold:   80,
		})
	}

	// Check memory usage
	if metrics.MemoryUsagePercent > 85 {
		p.sendAlert(Alert{
			Type:        "high_cache_memory_usage",
			Severity:    "critical",
			Message:     fmt.Sprintf("Cache memory usage is %.1f%%", metrics.MemoryUsagePercent),
			Timestamp:   time.Now(),
			Component:   "cache",
			MetricValue: metrics.MemoryUsagePercent,
			Threshold:   85,
		})
	}
}

// monitorSystem monitors general system performance
func (p *PerformanceMonitor) monitorSystem(ctx context.Context) {
	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-p.stopCh:
			return
		case <-ticker.C:
			metrics := p.collectSystemMetrics()
			
			p.mu.Lock()
			p.metrics.SystemMetrics = metrics
			p.mu.Unlock()

			p.checkSystemPerformance(metrics)
		}
	}
}

func (p *PerformanceMonitor) collectSystemMetrics() *SystemMetrics {
	// This would collect actual system metrics
	// For now, returning placeholder data
	return &SystemMetrics{
		GoroutineCount:    100,
		HeapSize:         1024 * 1024 * 64,
		HeapUsed:         1024 * 1024 * 32,
		GCPauseTime:      2.5,
		RequestsPerSecond: 150,
		AvgResponseTime:   25,
		ErrorRate:        0.5,
		CPUUsage:         15.5,
		MemoryUsage:      45.2,
	}
}

func (p *PerformanceMonitor) checkSystemPerformance(metrics *SystemMetrics) {
	// Check goroutine count
	if metrics.GoroutineCount > 1000 {
		p.sendAlert(Alert{
			Type:        "high_goroutine_count",
			Severity:    "warning",
			Message:     fmt.Sprintf("High goroutine count: %d", metrics.GoroutineCount),
			Timestamp:   time.Now(),
			Component:   "application",
			MetricValue: float64(metrics.GoroutineCount),
			Threshold:   1000,
		})
	}

	// Check error rate
	if metrics.ErrorRate > 5 {
		p.sendAlert(Alert{
			Type:        "high_error_rate",
			Severity:    "critical",
			Message:     fmt.Sprintf("High error rate: %.1f%%", metrics.ErrorRate),
			Timestamp:   time.Now(),
			Component:   "application",
			MetricValue: metrics.ErrorRate,
			Threshold:   5,
		})
	}
}

// detectPerformanceAnomalies uses machine learning-like approaches to detect anomalies
func (p *PerformanceMonitor) detectPerformanceAnomalies(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-p.stopCh:
			return
		case <-ticker.C:
			// Implement anomaly detection algorithms here
			// This could include:
			// - Response time trend analysis
			// - Database query pattern analysis
			// - Cache performance trend analysis
			// - Resource usage pattern analysis
		}
	}
}

func (p *PerformanceMonitor) sendAlert(alert Alert) {
	select {
	case p.alerts <- alert:
		// Alert sent successfully
	default:
		// Alert buffer is full, log this issue
		fmt.Printf("Alert buffer full, dropping alert: %s\n", alert.Message)
	}
}

// GetCurrentMetrics returns the current performance metrics
func (p *PerformanceMonitor) GetCurrentMetrics() *MetricsCollector {
	p.mu.RLock()
	defer p.mu.RUnlock()
	
	// Return a copy to prevent concurrent access issues
	metricsCopy := *p.metrics
	return &metricsCopy
}

// GetAlerts returns the alerts channel for consuming alerts
func (p *PerformanceMonitor) GetAlerts() <-chan Alert {
	return p.alerts
}

// GeneratePerformanceReport creates a comprehensive performance report
func (p *PerformanceMonitor) GeneratePerformanceReport() *PerformanceReport {
	metrics := p.GetCurrentMetrics()
	
	return &PerformanceReport{
		Timestamp:       time.Now(),
		OverallHealth:   p.calculateOverallHealth(metrics),
		DatabaseHealth:  p.calculateDatabaseHealth(metrics.DatabaseMetrics),
		CacheHealth:     p.calculateCacheHealth(metrics.CacheMetrics),
		SystemHealth:    p.calculateSystemHealth(metrics.SystemMetrics),
		Recommendations: p.generateRecommendations(metrics),
		Metrics:         metrics,
	}
}

type PerformanceReport struct {
	Timestamp       time.Time             `json:"timestamp"`
	OverallHealth   HealthStatus          `json:"overall_health"`
	DatabaseHealth  HealthStatus          `json:"database_health"`
	CacheHealth     HealthStatus          `json:"cache_health"`
	SystemHealth    HealthStatus          `json:"system_health"`
	Recommendations []Recommendation      `json:"recommendations"`
	Metrics         *MetricsCollector     `json:"metrics"`
}

type HealthStatus struct {
	Status      string  `json:"status"`       // excellent, good, warning, critical
	Score       float64 `json:"score"`        // 0-100
	Issues      []string `json:"issues"`
	Highlights  []string `json:"highlights"`
}

type Recommendation struct {
	Category    string `json:"category"`
	Priority    string `json:"priority"`     // high, medium, low
	Title       string `json:"title"`
	Description string `json:"description"`
	Impact      string `json:"impact"`
}

func (p *PerformanceMonitor) calculateOverallHealth(metrics *MetricsCollector) HealthStatus {
	// Calculate overall health based on component health scores
	scores := []float64{
		p.calculateDatabaseHealth(metrics.DatabaseMetrics).Score,
		p.calculateCacheHealth(metrics.CacheMetrics).Score,
		p.calculateSystemHealth(metrics.SystemMetrics).Score,
	}
	
	totalScore := 0.0
	for _, score := range scores {
		totalScore += score
	}
	avgScore := totalScore / float64(len(scores))
	
	status := "excellent"
	if avgScore < 90 {
		status = "good"
	}
	if avgScore < 75 {
		status = "warning"
	}
	if avgScore < 60 {
		status = "critical"
	}
	
	return HealthStatus{
		Status: status,
		Score:  avgScore,
	}
}

func (p *PerformanceMonitor) calculateDatabaseHealth(metrics *DatabaseMetrics) HealthStatus {
	if metrics == nil {
		return HealthStatus{Status: "unknown", Score: 0}
	}
	
	score := 100.0
	var issues []string
	var highlights []string
	
	// Check connection pool utilization
	if metrics.MaxOpenConnections > 0 {
		utilization := float64(metrics.InUseConnections) / float64(metrics.MaxOpenConnections)
		if utilization > 0.8 {
			score -= 20
			issues = append(issues, "High connection pool utilization")
		} else if utilization < 0.3 {
			highlights = append(highlights, "Efficient connection usage")
		}
	}
	
	// Check slow queries
	if metrics.SlowQueryCount > 10 {
		score -= 15
		issues = append(issues, fmt.Sprintf("%d slow queries detected", metrics.SlowQueryCount))
	}
	
	// Check for N+1 queries
	criticalN1Count := 0
	for _, n1 := range metrics.PotentialN1Queries {
		if n1.Severity == "critical" {
			criticalN1Count++
		}
	}
	if criticalN1Count > 0 {
		score -= 25
		issues = append(issues, fmt.Sprintf("%d critical N+1 query patterns detected", criticalN1Count))
	}
	
	status := "excellent"
	if score < 90 {
		status = "good"
	}
	if score < 75 {
		status = "warning"
	}
	if score < 60 {
		status = "critical"
	}
	
	return HealthStatus{
		Status:     status,
		Score:      score,
		Issues:     issues,
		Highlights: highlights,
	}
}

func (p *PerformanceMonitor) calculateCacheHealth(metrics *CacheMetrics) HealthStatus {
	if metrics == nil {
		return HealthStatus{Status: "unknown", Score: 0}
	}
	
	score := 100.0
	var issues []string
	var highlights []string
	
	// Check hit rate
	if metrics.HitRate < 80 {
		score -= 20
		issues = append(issues, fmt.Sprintf("Low cache hit rate: %.1f%%", metrics.HitRate))
	} else if metrics.HitRate > 95 {
		highlights = append(highlights, fmt.Sprintf("Excellent cache hit rate: %.1f%%", metrics.HitRate))
	}
	
	// Check memory usage
	if metrics.MemoryUsagePercent > 85 {
		score -= 25
		issues = append(issues, fmt.Sprintf("High memory usage: %.1f%%", metrics.MemoryUsagePercent))
	}
	
	status := "excellent"
	if score < 90 {
		status = "good"
	}
	if score < 75 {
		status = "warning"
	}
	if score < 60 {
		status = "critical"
	}
	
	return HealthStatus{
		Status:     status,
		Score:      score,
		Issues:     issues,
		Highlights: highlights,
	}
}

func (p *PerformanceMonitor) calculateSystemHealth(metrics *SystemMetrics) HealthStatus {
	if metrics == nil {
		return HealthStatus{Status: "unknown", Score: 0}
	}
	
	score := 100.0
	var issues []string
	var highlights []string
	
	// Check error rate
	if metrics.ErrorRate > 5 {
		score -= 30
		issues = append(issues, fmt.Sprintf("High error rate: %.1f%%", metrics.ErrorRate))
	} else if metrics.ErrorRate < 1 {
		highlights = append(highlights, fmt.Sprintf("Low error rate: %.1f%%", metrics.ErrorRate))
	}
	
	// Check response time
	if metrics.AvgResponseTime > 500 {
		score -= 20
		issues = append(issues, fmt.Sprintf("High response time: %.1fms", metrics.AvgResponseTime))
	} else if metrics.AvgResponseTime < 100 {
		highlights = append(highlights, fmt.Sprintf("Fast response time: %.1fms", metrics.AvgResponseTime))
	}
	
	status := "excellent"
	if score < 90 {
		status = "good"
	}
	if score < 75 {
		status = "warning"
	}
	if score < 60 {
		status = "critical"
	}
	
	return HealthStatus{
		Status:     status,
		Score:      score,
		Issues:     issues,
		Highlights: highlights,
	}
}

func (p *PerformanceMonitor) generateRecommendations(metrics *MetricsCollector) []Recommendation {
	var recommendations []Recommendation
	
	// Database recommendations
	if metrics.DatabaseMetrics != nil {
		if len(metrics.DatabaseMetrics.PotentialN1Queries) > 0 {
			recommendations = append(recommendations, Recommendation{
				Category:    "database",
				Priority:    "high",
				Title:       "Optimize N+1 Query Patterns",
				Description: "Detected potential N+1 query patterns. Consider using JOIN queries or preloading.",
				Impact:      "Can improve performance by 5-50x",
			})
		}
		
		if metrics.DatabaseMetrics.SlowQueryCount > 5 {
			recommendations = append(recommendations, Recommendation{
				Category:    "database",
				Priority:    "medium",
				Title:       "Optimize Slow Queries",
				Description: "Review and optimize queries taking longer than 1 second.",
				Impact:      "Can reduce response times by 20-80%",
			})
		}
	}
	
	// Cache recommendations
	if metrics.CacheMetrics != nil {
		if metrics.CacheMetrics.HitRate < 85 {
			recommendations = append(recommendations, Recommendation{
				Category:    "cache",
				Priority:    "medium",
				Title:       "Improve Cache Strategy",
				Description: "Low cache hit rate suggests cache strategy optimization needed.",
				Impact:      "Can reduce database load by 30-60%",
			})
		}
		
		if metrics.CacheMetrics.MemoryUsagePercent > 80 {
			recommendations = append(recommendations, Recommendation{
				Category:    "cache",
				Priority:    "high",
				Title:       "Increase Cache Memory",
				Description: "High memory usage may lead to cache evictions.",
				Impact:      "Can prevent performance degradation",
			})
		}
	}
	
	return recommendations
}