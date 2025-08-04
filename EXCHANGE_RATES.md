# Exchange Rate Automation - Malaka ERP

## Overview

This system automatically fetches exchange rates from Bank Indonesia daily and stores them in the database for use throughout the ERP system.

## Features

- **Daily Automated Fetching**: Runs at 9:30 AM WIB (after Bank Indonesia updates)
- **Dual API Sources**: Primary (Bank Indonesia) + Backup (ExchangeRate-API)
- **Database Storage**: Historical exchange rate data with buy/sell/middle rates
- **Scheduled Jobs**: Cron-based scheduling with error handling
- **Manual Operations**: Command-line tools for immediate fetching
- **Docker Integration**: Containerized service for production deployment

## API Sources

### 1. Bank Indonesia Official API (Primary)
```
URL: https://api.bi.go.id/kurs
Update Time: Daily at 9:00 AM WIB
Rate Types: Buy, Sell, Middle
Currencies: USD, EUR, SGD, JPY, GBP, AUD, CNY, MYR, THB, KRW
```

### 2. ExchangeRate-API (Backup)
```
URL: https://api.exchangerate-api.com/v4/latest/IDR
Update Time: Multiple times daily
Rate Types: Calculated buy/sell from middle rate
Free Tier: 1,500 requests/month
```

## Database Schema

### Exchange Rates Table
```sql
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(3) NOT NULL,           -- USD, EUR, SGD, etc.
    currency_name VARCHAR(100) NOT NULL,    -- US Dollar, Euro, etc.
    buy_rate DECIMAL(15,4) NOT NULL,        -- Bank buying rate
    sell_rate DECIMAL(15,4) NOT NULL,       -- Bank selling rate
    middle_rate DECIMAL(15,4) NOT NULL,     -- Average rate
    rate_date DATE NOT NULL,                -- Date for the rate
    last_updated TIMESTAMP WITH TIME ZONE,  -- When data was fetched
    source VARCHAR(50) NOT NULL,            -- Data source
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Settings Table
```sql
CREATE TABLE exchange_rate_settings (
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT
);
```

## Quick Start

### 1. Run Database Migration
```bash
cd backend
make migrate_up
```

### 2. Test API Connectivity
```bash
./exchange-rates.sh test
```

### 3. Fetch Rates Immediately
```bash
./exchange-rates.sh fetch
```

### 4. Start Scheduled Service
```bash
./exchange-rates.sh start
```

## Management Commands

### Using Shell Script (Recommended)
```bash
# Fetch rates immediately
./exchange-rates.sh fetch

# Start background scheduler
./exchange-rates.sh start

# Stop scheduler
./exchange-rates.sh stop

# Check status
./exchange-rates.sh status

# View logs
./exchange-rates.sh logs

# Run migrations
./exchange-rates.sh migrate

# Test API connectivity
./exchange-rates.sh test
```

### Using Go Commands Directly
```bash
cd backend

# Fetch rates immediately
go run cmd/exchange-rates/main.go -fetch

# Start scheduler
go run cmd/exchange-rates/main.go -start

# Show status
go run cmd/exchange-rates/main.go -status
```

### Using Docker Compose
```bash
# Start scheduler service
docker-compose -f docker-compose.exchange-rates.yml up -d

# Run one-time fetch
docker-compose -f docker-compose.exchange-rates.yml run --rm exchange-rate-fetcher

# View logs
docker-compose -f docker-compose.exchange-rates.yml logs -f exchange-rate-scheduler

# Stop service
docker-compose -f docker-compose.exchange-rates.yml down
```

## Scheduling Details

### Daily Schedule
- **Time**: 9:30 AM WIB (UTC+7)
- **Frequency**: Once per day
- **Days**: Monday to Sunday
- **Reason**: Bank Indonesia updates rates at 9:00 AM WIB

### Hourly Checks
- **Time**: 9:00 AM - 5:00 PM WIB
- **Frequency**: Every hour
- **Days**: Monday to Friday
- **Purpose**: Check for missed updates and retry if needed

### Timezone Handling
- **System Timezone**: Asia/Jakarta (WIB/UTC+7)
- **Cron Location**: WIB timezone configured
- **Database**: Timestamps stored in UTC with timezone

## Error Handling

### API Fallback Strategy
1. **Primary**: Try Bank Indonesia API first
2. **Backup**: Fall back to ExchangeRate-API if primary fails
3. **Notification**: Log errors and send alerts (configurable)
4. **Retry**: Hourly checks attempt to fill missed data

### Failure Scenarios
- **Network Issues**: Timeout after 30 seconds, try backup API
- **API Rate Limits**: Backup API used automatically
- **Data Validation**: Invalid rates are logged and skipped
- **Database Errors**: Detailed logging for troubleshooting

## Monitoring

### Status Checking
```bash
# Check if service is running
./exchange-rates.sh status

# View recent logs
./exchange-rates.sh logs

# Check database content
docker exec malaka-db psql -U postgres -d malaka -c "
  SELECT currency, middle_rate, rate_date, source 
  FROM exchange_rates 
  WHERE rate_date = CURRENT_DATE 
  ORDER BY currency;
"
```

### Log Files
- **Scheduler Logs**: Available via `docker logs malaka-exchange-rates`
- **Application Logs**: Structured logging with timestamps
- **Database Logs**: PostgreSQL logs for query debugging

## Production Deployment

### Environment Variables
```bash
# Database Connection
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=malaka

# Timezone
TZ=Asia/Jakarta

# Optional: API Keys
EXCHANGE_RATE_API_KEY=your-api-key
```

### Systemd Service (Alternative to Docker)
```ini
[Unit]
Description=Malaka Exchange Rate Scheduler
After=network.target postgresql.service

[Service]
Type=simple
User=malaka
WorkingDirectory=/opt/malaka/backend
ExecStart=/usr/local/go/bin/go run cmd/exchange-rates/main.go -start
Restart=always
RestartSec=10
Environment=TZ=Asia/Jakarta

[Install]
WantedBy=multi-user.target
```

### Monitoring and Alerts
- **Health Checks**: HTTP endpoint for service health
- **Notifications**: Email/Slack alerts on failures
- **Metrics**: Exchange rate fetch success/failure rates
- **Dashboards**: Grafana integration for visualization

## Data Usage

### Frontend Integration
The currency service in the frontend automatically uses the database rates:
```typescript
// Frontend will query the backend API which uses stored rates
const rates = await currencyService.getAllCurrencies()
```

### API Endpoints
```
GET /api/v1/accounting/exchange-rates/         # Get current rates
GET /api/v1/accounting/exchange-rates/history  # Get historical data
POST /api/v1/accounting/exchange-rates/refresh # Manual refresh
GET /api/v1/accounting/exchange-rates/status   # Service status
```

### Database Queries
```sql
-- Get today's rates
SELECT * FROM exchange_rates WHERE rate_date = CURRENT_DATE;

-- Get USD rates for last 30 days
SELECT rate_date, middle_rate, source 
FROM exchange_rates 
WHERE currency = 'USD' 
  AND rate_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY rate_date DESC;

-- Check data freshness
SELECT currency, rate_date, 
       CURRENT_DATE - rate_date AS days_old
FROM exchange_rates 
WHERE rate_date = (
  SELECT MAX(rate_date) FROM exchange_rates WHERE currency = 'USD'
);
```

## Troubleshooting

### Common Issues

1. **Service Won't Start**
   ```bash
   # Check Docker status
   docker ps | grep malaka
   
   # Check logs
   ./exchange-rates.sh logs
   
   # Restart service
   ./exchange-rates.sh stop && ./exchange-rates.sh start
   ```

2. **No Data Being Fetched**
   ```bash
   # Test API connectivity
   ./exchange-rates.sh test
   
   # Try manual fetch
   ./exchange-rates.sh fetch
   
   # Check database permissions
   docker exec malaka-db psql -U postgres -d malaka -c "\dt"
   ```

3. **Old Exchange Rates**
   ```bash
   # Check last update
   ./exchange-rates.sh status
   
   # Force refresh
   ./exchange-rates.sh fetch
   
   # Check scheduler status
   docker ps | grep exchange-rates
   ```

### Support Commands
```bash
# Full system status
./exchange-rates.sh status

# View detailed logs
docker logs malaka-exchange-rates --since 24h

# Database health check
docker exec malaka-db psql -U postgres -d malaka -c "
  SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT currency) as currencies,
    MAX(rate_date) as latest_date,
    MIN(rate_date) as earliest_date
  FROM exchange_rates;
"

# Check disk space
docker system df
```

## Configuration

### Supported Currencies
- USD (US Dollar)
- EUR (Euro)  
- SGD (Singapore Dollar)
- JPY (Japanese Yen)
- GBP (British Pound)
- AUD (Australian Dollar)
- CNY (Chinese Yuan)
- MYR (Malaysian Ringgit)
- THB (Thai Baht)
- KRW (Korean Won)

### Default Settings
- **Fetch Time**: 9:30 AM WIB
- **Retention**: 365 days
- **Spread**: 0.2% for calculated rates
- **Timeout**: 30 seconds per API call
- **Retry**: 3 attempts with exponential backoff

## Integration with ERP

### Accounting Module
- **Journal Entries**: Use latest exchange rates for foreign currency transactions
- **Financial Reports**: Multi-currency reports with historical rates
- **Currency Conversion**: Real-time conversion using stored rates

### Sales Module
- **International Sales**: Automatic currency conversion
- **Pricing**: Multi-currency product pricing
- **Invoicing**: Foreign currency invoice generation

### Purchase Module
- **Supplier Payments**: Foreign currency payment processing
- **Purchase Orders**: Multi-currency procurement
- **Expense Tracking**: Foreign currency expense management

This automated system ensures your ERP always has up-to-date, reliable exchange rate data from Bank Indonesia for accurate financial operations.