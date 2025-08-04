#!/bin/bash

# Exchange Rate Management Script for Malaka ERP
# Manages daily exchange rate fetching from Bank Indonesia

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}   Malaka ERP - Exchange Rates  ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

print_usage() {
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  fetch          Fetch exchange rates immediately"
    echo "  start          Start scheduled job (runs continuously)"
    echo "  stop           Stop scheduled job"
    echo "  status         Show current status"
    echo "  logs           Show logs from scheduled job"
    echo "  migrate        Run database migrations"
    echo "  test           Test API connectivity"
    echo "  help           Show this help"
    echo
    echo "Examples:"
    echo "  $0 fetch       # Fetch rates now"
    echo "  $0 start       # Start background scheduler"
    echo "  $0 status      # Check current status"
}

fetch_rates() {
    echo -e "${YELLOW}Fetching exchange rates...${NC}"
    
    cd "$BACKEND_DIR"
    if go run cmd/exchange-rates/main.go -fetch; then
        echo -e "${GREEN}✓ Exchange rates fetched successfully!${NC}"
    else
        echo -e "${RED}✗ Failed to fetch exchange rates${NC}"
        exit 1
    fi
}

start_scheduler() {
    echo -e "${YELLOW}Starting exchange rate scheduler...${NC}"
    
    # Check if already running
    if docker ps | grep -q "malaka-exchange-rates"; then
        echo -e "${YELLOW}Scheduler is already running${NC}"
        return
    fi
    
    docker-compose -f docker-compose.exchange-rates.yml up -d exchange-rate-scheduler
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Exchange rate scheduler started successfully!${NC}"
        echo -e "${BLUE}Daily updates scheduled at 9:30 AM WIB${NC}"
        echo -e "${BLUE}Hourly checks during business hours (9 AM - 5 PM WIB)${NC}"
    else
        echo -e "${RED}✗ Failed to start scheduler${NC}"
        exit 1
    fi
}

stop_scheduler() {
    echo -e "${YELLOW}Stopping exchange rate scheduler...${NC}"
    
    docker-compose -f docker-compose.exchange-rates.yml down
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Exchange rate scheduler stopped${NC}"
    else
        echo -e "${RED}✗ Failed to stop scheduler${NC}"
        exit 1
    fi
}

show_status() {
    echo -e "${YELLOW}Exchange Rate Service Status${NC}"
    echo "=============================="
    
    # Check if scheduler is running
    if docker ps | grep -q "malaka-exchange-rates"; then
        echo -e "Scheduler Status: ${GREEN}RUNNING${NC}"
        
        # Show container info
        docker ps --filter "name=malaka-exchange-rates" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        
        echo
        echo "Next scheduled run: $(date -d 'tomorrow 09:30' '+%Y-%m-%d 09:30:00 WIB')"
    else
        echo -e "Scheduler Status: ${RED}STOPPED${NC}"
    fi
    
    echo
    echo "Supported Currencies: USD, EUR, SGD, JPY, GBP, AUD, CNY, MYR, THB, KRW"
    echo "Primary Source: Bank Indonesia API"
    echo "Backup Source: ExchangeRate-API"
    
    # Check last update from database (if available)
    echo
    echo "Database Status:"
    if docker exec malaka-db psql -U postgres -d malaka -c "SELECT COUNT(*) as rate_count, MAX(rate_date) as latest_date FROM exchange_rates;" 2>/dev/null; then
        echo -e "${GREEN}✓ Database accessible${NC}"
    else
        echo -e "${YELLOW}⚠ Database not accessible or table not created${NC}"
    fi
}

show_logs() {
    echo -e "${YELLOW}Exchange Rate Scheduler Logs${NC}"
    echo "============================"
    
    if docker ps | grep -q "malaka-exchange-rates"; then
        docker logs -f malaka-exchange-rates
    else
        echo -e "${RED}Scheduler is not running${NC}"
        exit 1
    fi
}

run_migrations() {
    echo -e "${YELLOW}Running exchange rate database migrations...${NC}"
    
    cd "$BACKEND_DIR"
    
    # Check if migration exists
    if [ ! -f "internal/pkg/database/migrations/066_create_exchange_rates_table.sql" ]; then
        echo -e "${RED}✗ Migration file not found${NC}"
        exit 1
    fi
    
    # Run migration using goose or your migration tool
    echo -e "${BLUE}Applying migration 066_create_exchange_rates_table.sql${NC}"
    
    # Use the existing migration system
    if make migrate_up 2>/dev/null; then
        echo -e "${GREEN}✓ Migrations completed successfully${NC}"
    else
        echo -e "${YELLOW}⚠ Migration command not available, run manually:${NC}"
        echo "cd $BACKEND_DIR && make migrate_up"
    fi
}

test_api() {
    echo -e "${YELLOW}Testing API connectivity...${NC}"
    
    echo "Testing Bank Indonesia API..."
    if curl -s --max-time 10 "https://api.bi.go.id/kurs" > /dev/null; then
        echo -e "${GREEN}✓ Bank Indonesia API accessible${NC}"
    else
        echo -e "${RED}✗ Bank Indonesia API not accessible${NC}"
    fi
    
    echo "Testing backup API..."
    if curl -s --max-time 10 "https://api.exchangerate-api.com/v4/latest/IDR" > /dev/null; then
        echo -e "${GREEN}✓ Backup API accessible${NC}"
    else
        echo -e "${RED}✗ Backup API not accessible${NC}"
    fi
    
    echo
    echo -e "${BLUE}Both APIs tested. Service will fallback automatically if primary fails.${NC}"
}

# Main script logic
print_header

case "${1:-help}" in
    "fetch")
        fetch_rates
        ;;
    "start")
        start_scheduler
        ;;
    "stop")
        stop_scheduler
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "migrate")
        run_migrations
        ;;
    "test")
        test_api
        ;;
    "help"|*)
        print_usage
        ;;
esac