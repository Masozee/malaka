#!/bin/bash

# Malaka ERP Database Performance Testing Script
# This script runs before and after optimization to measure improvements

set -e

echo "🚀 MALAKA ERP - DATABASE PERFORMANCE TESTING"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if database is running
echo -e "${BLUE}Checking database connection...${NC}"
if ! PGPASSWORD=TanahAbang1971 psql -h localhost -U postgres -d malaka -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Database is not accessible. Please start the database first.${NC}"
    echo "Run: docker-compose up -d postgres"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"

# Create results directory
mkdir -p test/results
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULT_FILE="test/results/performance_baseline_${TIMESTAMP}.txt"

echo -e "${YELLOW}📊 Running performance baseline tests...${NC}"
echo "Results will be saved to: $RESULT_FILE"

# Run the Go performance test
cd test
go run performance_baseline.go > "../${RESULT_FILE}" 2>&1

# Also run some direct SQL timing tests
echo -e "${BLUE}Running additional SQL timing tests...${NC}"

{
    echo ""
    echo "📋 ADDITIONAL SQL TIMING TESTS"
    echo "=============================="
    echo ""
    
    # Test 1: Simple count queries
    echo "Test: Simple COUNT queries"
    echo "─────────────────────────────"
    PGPASSWORD=TanahAbang1971 psql -h localhost -U postgres -d malaka -c "\timing on" -c "SELECT 'articles' as table_name, COUNT(*) FROM articles UNION ALL SELECT 'customers', COUNT(*) FROM customers UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders;" 2>&1
    
    echo ""
    
    # Test 2: Complex aggregation
    echo "Test: Complex aggregation query"
    echo "─────────────────────────────────"
    PGPASSWORD=TanahAbang1971 psql -h localhost -U postgres -d malaka -c "\timing on" -c "
    SELECT 
        po.status,
        COUNT(*) as order_count,
        SUM(poi.quantity * poi.unit_price) as total_value
    FROM purchase_orders po
    LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
    GROUP BY po.status;" 2>&1
    
    echo ""
    
    # Test 3: Stock balance query
    echo "Test: Stock balance with joins"
    echo "────────────────────────────────"
    PGPASSWORD=TanahAbang1971 psql -h localhost -U postgres -d malaka -c "\timing on" -c "
    SELECT 
        a.name as article_name,
        w.name as warehouse_name,
        sb.quantity
    FROM stock_balances sb
    LEFT JOIN articles a ON sb.article_id = a.id
    LEFT JOIN warehouses w ON sb.warehouse_id = w.id
    WHERE sb.quantity > 0
    ORDER BY sb.quantity DESC
    LIMIT 50;" 2>&1

    echo ""
    
    # Test 4: Search query
    echo "Test: Text search query"
    echo "─────────────────────────"
    PGPASSWORD=TanahAbang1971 psql -h localhost -U postgres -d malaka -c "\timing on" -c "
    SELECT name, phone, address 
    FROM customers 
    WHERE name ILIKE '%budi%' OR name ILIKE '%sari%' 
    LIMIT 20;" 2>&1

} >> "$RESULT_FILE"

cd ..

echo ""
echo -e "${GREEN}✅ Performance baseline tests completed!${NC}"
echo -e "${BLUE}📄 Results saved to: ${RESULT_FILE}${NC}"

# Show a summary
echo ""
echo -e "${YELLOW}📊 QUICK SUMMARY${NC}"
echo "=================="

# Extract key metrics from the results
if grep -q "Average Query Time" "$RESULT_FILE"; then
    echo -e "${BLUE}Current Performance Metrics:${NC}"
    grep "Average Query Time" "$RESULT_FILE" || echo "No average query time found"
    grep "Average Queries/Second" "$RESULT_FILE" || echo "No QPS metric found"
    
    echo ""
    echo -e "${BLUE}Connection Statistics:${NC}"
    grep -A 5 "Max Open Connections" "$RESULT_FILE" | head -6 || echo "No connection stats found"
else
    echo -e "${RED}❌ Could not extract performance metrics from results${NC}"
fi

echo ""
echo -e "${YELLOW}💡 NEXT STEPS:${NC}"
echo "1. Review the detailed results in: $RESULT_FILE"
echo "2. Note the current average query times"
echo "3. Run database optimizations (indexes, connection pool, etc.)"
echo "4. Re-run this test to measure improvements"

echo ""
echo -e "${GREEN}🎯 Ready to optimize! Your baseline is established.${NC}"