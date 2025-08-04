package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// Test script to demonstrate N+1 query optimization results

func main() {
	// Connect to database
	db, err := sqlx.Connect("postgres", "postgres://postgres:TanahAbang1971@localhost:5432/malaka?sslmode=disable")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	fmt.Println("🚀 N+1 QUERY OPTIMIZATION PERFORMANCE TEST")
	fmt.Println("==========================================")
	fmt.Println()

	// Test cost center allocation processing
	testCostCenterAllocations(db)
	
	// Test article queries with relations
	testArticleQueries(db)
	
	// Test stock balance queries
	testStockBalanceQueries(db)
}

func testCostCenterAllocations(db *sqlx.DB) {
	fmt.Println("📊 COST CENTER ALLOCATION PROCESSING")
	fmt.Println("-----------------------------------")

	ctx := context.Background()
	
	// Create some test data if needed
	setupTestCostCenterData(db, ctx)

	// Test original N+1 query pattern (simulated)
	fmt.Println("1. Simulating ORIGINAL N+1 Query Pattern:")
	start := time.Now()
	err := simulateOriginalN1Pattern(db, ctx)
	originalTime := time.Since(start)
	if err != nil {
		fmt.Printf("   ❌ Error: %v\n", err)
	} else {
		fmt.Printf("   ⏱️  Time: %v\n", originalTime)
	}

	// Test optimized single query pattern
	fmt.Println("2. Testing OPTIMIZED Single Query Pattern:")
	start = time.Now()
	err = testOptimizedQuery(db, ctx)
	optimizedTime := time.Since(start)
	if err != nil {
		fmt.Printf("   ❌ Error: %v\n", err)
	} else {
		fmt.Printf("   ⏱️  Time: %v\n", optimizedTime)
	}

	// Calculate improvement
	if originalTime > 0 && optimizedTime > 0 {
		improvement := float64(originalTime) / float64(optimizedTime)
		fmt.Printf("🚀 IMPROVEMENT: %.2fx faster (%.2fms → %.2fms)\n", 
			improvement, 
			float64(originalTime.Microseconds())/1000.0,
			float64(optimizedTime.Microseconds())/1000.0)
	}
	fmt.Println()
}

func setupTestCostCenterData(db *sqlx.DB, ctx context.Context) {
	// Check if we have test data
	var count int
	err := db.GetContext(ctx, &count, "SELECT COUNT(*) FROM cost_center_allocations")
	if err != nil || count > 0 {
		return // Skip if error or data exists
	}

	fmt.Println("   📝 Setting up test data...")
	
	// Create minimal test data (we'll skip this for now since tables may not exist)
	// In a real scenario, you'd ensure test data exists
}

func simulateOriginalN1Pattern(db *sqlx.DB, ctx context.Context) error {
	// Simulate the original N+1 pattern with multiple individual queries
	
	// First query: Get allocations
	allocations, err := db.QueryContext(ctx, `
		SELECT id, source_cost_center_id 
		FROM cost_center_allocations 
		WHERE is_active = true 
		LIMIT 10
	`)
	if err != nil {
		return fmt.Errorf("failed to get allocations: %w", err)
	}
	defer allocations.Close()

	queryCount := 1 // Count the initial query
	
	// N queries: For each allocation, get costs (simulating N+1 pattern)
	for allocations.Next() {
		var id, sourceCostCenterID uuid.UUID
		if err := allocations.Scan(&id, &sourceCostCenterID); err != nil {
			continue
		}
		
		// This is the N+1 query - one query per allocation
		// Note: Simulating with available schema (allocated_amount from allocations)
		var costs float64
		err := db.GetContext(ctx, &costs, `
			SELECT COALESCE(allocated_amount, 0) 
			FROM cost_center_allocations 
			WHERE source_cost_center_id = $1 
				AND is_active = true
			LIMIT 1
		`, sourceCostCenterID)
		
		if err == nil {
			queryCount++
		}
	}
	
	fmt.Printf("   📊 Executed %d separate queries (N+1 pattern)\n", queryCount)
	return nil
}

func testOptimizedQuery(db *sqlx.DB, ctx context.Context) error {
	// Test the optimized single query approach
	// Note: Since general_ledger doesn't have cost_center_id in current schema,
	// we'll demonstrate the optimization pattern with available data
	
	rows, err := db.QueryContext(ctx, `
		SELECT 
			a.id,
			a.source_cost_center_id,
			a.allocated_amount as source_costs
		FROM cost_center_allocations a
		WHERE a.is_active = true
		LIMIT 10
	`)
	if err != nil {
		return fmt.Errorf("failed to execute optimized query: %w", err)
	}
	defer rows.Close()

	allocationCount := 0
	for rows.Next() {
		var id, sourceCostCenterID uuid.UUID
		var costs float64
		if err := rows.Scan(&id, &sourceCostCenterID, &costs); err != nil {
			continue
		}
		allocationCount++
	}
	
	fmt.Printf("   📊 Executed 1 single query (processed %d allocations)\n", allocationCount)
	return nil
}

func testArticleQueries(db *sqlx.DB) {
	fmt.Println("📦 ARTICLE QUERIES WITH RELATIONS")
	fmt.Println("---------------------------------")

	ctx := context.Background()

	// Test N+1 pattern for articles
	fmt.Println("1. Simulating ORIGINAL Article N+1 Pattern:")
	start := time.Now()
	err := simulateArticleN1Pattern(db, ctx)
	originalTime := time.Since(start)
	if err != nil {
		fmt.Printf("   ❌ Error: %v\n", err)
	} else {
		fmt.Printf("   ⏱️  Time: %v\n", originalTime)
	}

	// Test optimized JOIN query
	fmt.Println("2. Testing OPTIMIZED Article JOIN Query:")
	start = time.Now()
	err = testOptimizedArticleQuery(db, ctx)
	optimizedTime := time.Since(start)
	if err != nil {
		fmt.Printf("   ❌ Error: %v\n", err)
	} else {
		fmt.Printf("   ⏱️  Time: %v\n", optimizedTime)
	}

	// Calculate improvement
	if originalTime > 0 && optimizedTime > 0 {
		improvement := float64(originalTime) / float64(optimizedTime)
		fmt.Printf("🚀 IMPROVEMENT: %.2fx faster (%.2fms → %.2fms)\n", 
			improvement, 
			float64(originalTime.Microseconds())/1000.0,
			float64(optimizedTime.Microseconds())/1000.0)
	}
	fmt.Println()
}

func simulateArticleN1Pattern(db *sqlx.DB, ctx context.Context) error {
	// First query: Get articles
	articles, err := db.QueryContext(ctx, `
		SELECT id, name, classification_id, color_id, model_id, supplier_id 
		FROM articles 
		LIMIT 10
	`)
	if err != nil {
		return fmt.Errorf("failed to get articles: %w", err)
	}
	defer articles.Close()

	queryCount := 1
	
	// N queries: Get related data for each article
	for articles.Next() {
		var id, classificationID, colorID, modelID, supplierID uuid.UUID
		var name string
		if err := articles.Scan(&id, &name, &classificationID, &colorID, &modelID, &supplierID); err != nil {
			continue
		}
		
		// Multiple individual queries (simulating N+1)
		var classificationName, colorName, modelName, supplierName string
		
		db.GetContext(ctx, &classificationName, "SELECT name FROM classifications WHERE id = $1", classificationID)
		db.GetContext(ctx, &colorName, "SELECT name FROM colors WHERE id = $1", colorID)
		db.GetContext(ctx, &modelName, "SELECT name FROM models WHERE id = $1", modelID)
		db.GetContext(ctx, &supplierName, "SELECT name FROM suppliers WHERE id = $1", supplierID)
		
		queryCount += 4 // 4 additional queries per article
	}
	
	fmt.Printf("   📊 Executed %d separate queries (N+1 pattern)\n", queryCount)
	return nil
}

func testOptimizedArticleQuery(db *sqlx.DB, ctx context.Context) error {
	// Single query with JOINs
	rows, err := db.QueryContext(ctx, `
		SELECT 
			a.id, a.name,
			COALESCE(c.name, '') as classification_name,
			COALESCE(col.name, '') as color_name,
			COALESCE(m.name, '') as model_name,
			COALESCE(s.name, '') as supplier_name
		FROM articles a
		LEFT JOIN classifications c ON a.classification_id = c.id
		LEFT JOIN colors col ON a.color_id = col.id
		LEFT JOIN models m ON a.model_id = m.id
		LEFT JOIN suppliers s ON a.supplier_id = s.id
		LIMIT 10
	`)
	if err != nil {
		return fmt.Errorf("failed to execute optimized article query: %w", err)
	}
	defer rows.Close()

	articleCount := 0
	for rows.Next() {
		var id uuid.UUID
		var name, classificationName, colorName, modelName, supplierName string
		if err := rows.Scan(&id, &name, &classificationName, &colorName, &modelName, &supplierName); err != nil {
			continue
		}
		articleCount++
	}
	
	fmt.Printf("   📊 Executed 1 single query (processed %d articles)\n", articleCount)
	return nil
}

func testStockBalanceQueries(db *sqlx.DB) {
	fmt.Println("📦 STOCK BALANCE QUERIES WITH DETAILS")
	fmt.Println("------------------------------------")

	ctx := context.Background()

	// Test optimized stock balance query
	fmt.Println("Testing OPTIMIZED Stock Balance Query:")
	start := time.Now()
	err := testOptimizedStockBalanceQuery(db, ctx)
	queryTime := time.Since(start)
	if err != nil {
		fmt.Printf("   ❌ Error: %v\n", err)
	} else {
		fmt.Printf("   ⏱️  Time: %v\n", queryTime)
	}
	fmt.Println()
}

func testOptimizedStockBalanceQuery(db *sqlx.DB, ctx context.Context) error {
	// Single query with multiple JOINs for stock balances
	rows, err := db.QueryContext(ctx, `
		SELECT 
			sb.id, sb.quantity,
			COALESCE(a.name, '') as article_name,
			COALESCE(w.name, '') as warehouse_name,
			COALESCE(c.name, '') as classification_name,
			COALESCE(col.name, '') as color_name
		FROM stock_balances sb
		LEFT JOIN articles a ON sb.article_id = a.id
		LEFT JOIN warehouses w ON sb.warehouse_id = w.id
		LEFT JOIN classifications c ON a.classification_id = c.id
		LEFT JOIN colors col ON a.color_id = col.id
		WHERE sb.quantity > 0
		LIMIT 20
	`)
	if err != nil {
		return fmt.Errorf("failed to execute optimized stock balance query: %w", err)
	}
	defer rows.Close()

	stockCount := 0
	for rows.Next() {
		var id uuid.UUID
		var quantity int
		var articleName, warehouseName, classificationName, colorName string
		if err := rows.Scan(&id, &quantity, &articleName, &warehouseName, &classificationName, &colorName); err != nil {
			continue
		}
		stockCount++
	}
	
	fmt.Printf("   📊 Processed %d stock balance records with full details\n", stockCount)
	return nil
}