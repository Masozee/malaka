package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// PerformanceTest represents a single performance test
type PerformanceTest struct {
	Name        string
	Query       string
	Description string
}

// TestResult holds the results of a performance test
type TestResult struct {
	TestName      string
	AvgTime       time.Duration
	MinTime       time.Duration
	MaxTime       time.Duration
	TotalTime     time.Duration
	Iterations    int
	ErrorCount    int
	QueriesPerSec float64
}

// DatabaseTester handles database performance testing
type DatabaseTester struct {
	db     *sqlx.DB
	ctx    context.Context
	cancel context.CancelFunc
}

// NewDatabaseTester creates a new database tester
func NewDatabaseTester(connStr string) (*DatabaseTester, error) {
	db, err := sqlx.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	ctx, cancel := context.WithCancel(context.Background())

	return &DatabaseTester{
		db:     db,
		ctx:    ctx,
		cancel: cancel,
	}, nil
}

// GetBasicPerformanceTests returns a set of basic performance tests
func (dt *DatabaseTester) GetBasicPerformanceTests() []PerformanceTest {
	return []PerformanceTest{
		{
			Name:        "Simple Article Lookup",
			Query:       "SELECT id, name, code, price FROM articles LIMIT 100",
			Description: "Basic article retrieval without joins",
		},
		{
			Name:        "Articles with Company Join",
			Query:       "SELECT a.id, a.name, a.code, c.name as company_name FROM articles a LEFT JOIN companies c ON a.company_id = c.id LIMIT 100",
			Description: "Article lookup with company information",
		},
		{
			Name:        "Complex Inventory Query",
			Query:       "SELECT a.name, sb.quantity, w.name as warehouse FROM stock_balances sb JOIN articles a ON sb.article_id = a.id JOIN warehouses w ON sb.warehouse_id = w.id WHERE sb.quantity > 0 LIMIT 100",
			Description: "Stock balance lookup with article and warehouse names",
		},
		{
			Name:        "Purchase Orders with Items",
			Query:       "SELECT po.id, po.order_number, po.status, COUNT(poi.id) as item_count FROM purchase_orders po LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id GROUP BY po.id, po.order_number, po.status LIMIT 50",
			Description: "Purchase orders with item counts",
		},
		{
			Name:        "Customer Search",
			Query:       "SELECT id, name, phone, address FROM customers WHERE name ILIKE '%a%' LIMIT 50",
			Description: "Customer search by name pattern",
		},
		{
			Name:        "Dashboard Statistics",
			Query:       "SELECT (SELECT COUNT(*) FROM articles) as total_articles, (SELECT COUNT(*) FROM customers) as total_customers, (SELECT COUNT(*) FROM purchase_orders WHERE status = 'pending') as pending_orders",
			Description: "Dashboard statistics aggregation",
		},
		{
			Name:        "Sales Order History",
			Query:       "SELECT so.id, so.order_number, c.name as customer_name, so.total_amount, so.created_at FROM sales_orders so LEFT JOIN customers c ON so.customer_id = c.id ORDER BY so.created_at DESC LIMIT 100",
			Description: "Recent sales orders with customer names",
		},
		{
			Name:        "Goods Receipt Details",
			Query:       "SELECT gr.id, gr.receipt_number, po.order_number, s.name as supplier_name FROM goods_receipts gr LEFT JOIN purchase_orders po ON gr.purchase_order_id = po.id LEFT JOIN suppliers s ON po.supplier_id = s.id LIMIT 50",
			Description: "Goods receipts with purchase order and supplier info",
		},
	}
}

// RunSingleTest executes a single performance test
func (dt *DatabaseTester) RunSingleTest(test PerformanceTest, iterations int) TestResult {
	result := TestResult{
		TestName:   test.Name,
		Iterations: iterations,
		MinTime:    time.Hour, // Initialize with high value
	}

	fmt.Printf("Running test: %s (%d iterations)\n", test.Name, iterations)
	
	startTotal := time.Now()
	
	for i := 0; i < iterations; i++ {
		start := time.Now()
		
		rows, err := dt.db.QueryContext(dt.ctx, test.Query)
		if err != nil {
			result.ErrorCount++
			fmt.Printf("  Error on iteration %d: %v\n", i+1, err)
			continue
		}
		
		// Consume all rows to ensure complete execution
		for rows.Next() {
			// Do nothing, just consume
		}
		rows.Close()
		
		duration := time.Since(start)
		
		// Update statistics
		if duration < result.MinTime {
			result.MinTime = duration
		}
		if duration > result.MaxTime {
			result.MaxTime = duration
		}
	}
	
	result.TotalTime = time.Since(startTotal)
	successfulIterations := iterations - result.ErrorCount
	
	if successfulIterations > 0 {
		result.AvgTime = result.TotalTime / time.Duration(successfulIterations)
		result.QueriesPerSec = float64(successfulIterations) / result.TotalTime.Seconds()
	}

	return result
}

// RunConcurrentTest executes a test with multiple concurrent goroutines
func (dt *DatabaseTester) RunConcurrentTest(test PerformanceTest, goroutines, iterationsPerGoroutine int) TestResult {
	result := TestResult{
		TestName:   fmt.Sprintf("%s (Concurrent: %d goroutines)", test.Name, goroutines),
		Iterations: goroutines * iterationsPerGoroutine,
		MinTime:    time.Hour,
	}

	fmt.Printf("Running concurrent test: %s (%d goroutines, %d iterations each)\n", 
		test.Name, goroutines, iterationsPerGoroutine)
	
	var wg sync.WaitGroup
	var mu sync.Mutex
	var totalDuration time.Duration
	var errorCount int
	var minTime = time.Hour
	var maxTime time.Duration

	startTotal := time.Now()

	for g := 0; g < goroutines; g++ {
		wg.Add(1)
		
		go func(goroutineID int) {
			defer wg.Done()
			
			for i := 0; i < iterationsPerGoroutine; i++ {
				start := time.Now()
				
				rows, err := dt.db.QueryContext(dt.ctx, test.Query)
				if err != nil {
					mu.Lock()
					errorCount++
					mu.Unlock()
					continue
				}
				
				// Consume all rows
				for rows.Next() {
					// Do nothing, just consume
				}
				rows.Close()
				
				duration := time.Since(start)
				
				// Update statistics with mutex protection
				mu.Lock()
				totalDuration += duration
				if duration < minTime {
					minTime = duration
				}
				if duration > maxTime {
					maxTime = duration
				}
				mu.Unlock()
			}
		}(g)
	}

	wg.Wait()
	
	result.TotalTime = time.Since(startTotal)
	result.MinTime = minTime
	result.MaxTime = maxTime
	result.ErrorCount = errorCount
	
	successfulIterations := result.Iterations - result.ErrorCount
	if successfulIterations > 0 {
		result.AvgTime = totalDuration / time.Duration(successfulIterations)
		result.QueriesPerSec = float64(successfulIterations) / result.TotalTime.Seconds()
	}

	return result
}

// PrintResult prints a formatted test result
func (dt *DatabaseTester) PrintResult(result TestResult) {
	fmt.Printf("\n📊 RESULTS FOR: %s\n", result.TestName)
	fmt.Printf("════════════════════════════════════════════════════════════════\n")
	fmt.Printf("Total Iterations: %d\n", result.Iterations)
	fmt.Printf("Errors: %d\n", result.ErrorCount)
	fmt.Printf("Average Time: %v\n", result.AvgTime)
	fmt.Printf("Min Time: %v\n", result.MinTime)
	fmt.Printf("Max Time: %v\n", result.MaxTime)
	fmt.Printf("Total Time: %v\n", result.TotalTime)
	fmt.Printf("Queries/Second: %.2f\n", result.QueriesPerSec)
	fmt.Printf("════════════════════════════════════════════════════════════════\n\n")
}

// GetConnectionStats returns current database connection statistics
func (dt *DatabaseTester) GetConnectionStats() {
	stats := dt.db.Stats()
	
	fmt.Printf("📈 DATABASE CONNECTION STATISTICS\n")
	fmt.Printf("════════════════════════════════════════════════════════════════\n")
	fmt.Printf("Max Open Connections: %d\n", stats.MaxOpenConnections)
	fmt.Printf("Open Connections: %d\n", stats.OpenConnections)
	fmt.Printf("In Use: %d\n", stats.InUse)
	fmt.Printf("Idle: %d\n", stats.Idle)
	fmt.Printf("Wait Count: %d\n", stats.WaitCount)
	fmt.Printf("Wait Duration: %v\n", stats.WaitDuration)
	fmt.Printf("Max Idle Closed: %d\n", stats.MaxIdleClosed)
	fmt.Printf("Max Idle Time Closed: %d\n", stats.MaxIdleTimeClosed)
	fmt.Printf("Max Lifetime Closed: %d\n", stats.MaxLifetimeClosed)
	fmt.Printf("════════════════════════════════════════════════════════════════\n\n")
}

// CheckTableSizes returns information about table sizes
func (dt *DatabaseTester) CheckTableSizes() error {
	query := `
		SELECT 
			schemaname,
			tablename,
			pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
			pg_stat_get_tuples_returned(c.oid) as tuples_read,
			pg_stat_get_tuples_fetched(c.oid) as tuples_fetched
		FROM pg_tables t
		JOIN pg_class c ON c.relname = t.tablename
		WHERE schemaname = 'public'
		ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
		LIMIT 20
	`

	fmt.Printf("📦 TABLE SIZES (Top 20)\n")
	fmt.Printf("════════════════════════════════════════════════════════════════\n")
	fmt.Printf("%-20s %-15s %-15s %-15s\n", "Table", "Size", "Tuples Read", "Tuples Fetched")
	fmt.Printf("────────────────────────────────────────────────────────────────\n")

	rows, err := dt.db.Query(query)
	if err != nil {
		return fmt.Errorf("failed to get table sizes: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var schema, table, size string
		var tuplesRead, tuplesFetched sql.NullInt64
		
		err := rows.Scan(&schema, &table, &size, &tuplesRead, &tuplesFetched)
		if err != nil {
			continue
		}
		
		readStr := "N/A"
		fetchStr := "N/A"
		
		if tuplesRead.Valid {
			readStr = fmt.Sprintf("%d", tuplesRead.Int64)
		}
		if tuplesFetched.Valid {
			fetchStr = fmt.Sprintf("%d", tuplesFetched.Int64)
		}
		
		fmt.Printf("%-20s %-15s %-15s %-15s\n", table, size, readStr, fetchStr)
	}
	
	fmt.Printf("════════════════════════════════════════════════════════════════\n\n")
	return nil
}

// Close closes the database connection
func (dt *DatabaseTester) Close() error {
	dt.cancel()
	return dt.db.Close()
}

func main() {
	// Get database connection string from environment or use default
	connStr := os.Getenv("DB_SOURCE")
	if connStr == "" {
		connStr = "postgres://postgres:TanahAbang1971@localhost:5432/malaka?sslmode=disable"
	}

	fmt.Printf("🚀 MALAKA ERP - DATABASE PERFORMANCE BASELINE TEST\n")
	fmt.Printf("Connection: %s\n", connStr)
	fmt.Printf("════════════════════════════════════════════════════════════════\n\n")

	tester, err := NewDatabaseTester(connStr)
	if err != nil {
		log.Fatal("Failed to create database tester:", err)
	}
	defer tester.Close()

	// Show current connection statistics
	tester.GetConnectionStats()

	// Show table sizes
	if err := tester.CheckTableSizes(); err != nil {
		fmt.Printf("Warning: Could not get table sizes: %v\n\n", err)
	}

	// Get performance tests
	tests := tester.GetBasicPerformanceTests()

	// Run single-threaded tests
	fmt.Printf("🏃 RUNNING SINGLE-THREADED TESTS (10 iterations each)\n")
	fmt.Printf("════════════════════════════════════════════════════════════════\n")
	
	var singleResults []TestResult
	for _, test := range tests {
		result := tester.RunSingleTest(test, 10)
		singleResults = append(singleResults, result)
		tester.PrintResult(result)
	}

	// Run concurrent tests on critical queries
	fmt.Printf("🔄 RUNNING CONCURRENT TESTS (5 goroutines, 10 iterations each)\n")
	fmt.Printf("════════════════════════════════════════════════════════════════\n")
	
	criticalTests := []PerformanceTest{
		tests[0], // Simple Article Lookup
		tests[2], // Complex Inventory Query
		tests[5], // Dashboard Statistics
	}

	var concurrentResults []TestResult
	for _, test := range criticalTests {
		result := tester.RunConcurrentTest(test, 5, 10)
		concurrentResults = append(concurrentResults, result)
		tester.PrintResult(result)
	}

	// Show final connection statistics
	fmt.Printf("📈 FINAL CONNECTION STATISTICS\n")
	tester.GetConnectionStats()

	// Summary
	fmt.Printf("✅ BASELINE TEST COMPLETED\n")
	fmt.Printf("════════════════════════════════════════════════════════════════\n")
	fmt.Printf("Total Tests Run: %d single-threaded + %d concurrent\n", 
		len(singleResults), len(concurrentResults))
	
	// Calculate overall averages
	var totalAvgTime time.Duration
	var totalQueries float64
	successfulTests := 0
	
	for _, result := range singleResults {
		if result.ErrorCount == 0 {
			totalAvgTime += result.AvgTime
			totalQueries += result.QueriesPerSec
			successfulTests++
		}
	}
	
	if successfulTests > 0 {
		avgAvgTime := totalAvgTime / time.Duration(successfulTests)
		avgQPS := totalQueries / float64(successfulTests)
		
		fmt.Printf("Average Query Time: %v\n", avgAvgTime)
		fmt.Printf("Average Queries/Second: %.2f\n", avgQPS)
	}
	
	fmt.Printf("\n💾 Save these results to compare after optimization!\n")
}