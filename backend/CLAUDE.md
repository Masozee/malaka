# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Malaka is a Go-based ERP (Enterprise Resource Planning) system built with Clean Architecture principles. It provides comprehensive business modules for master data, inventory, sales, finance, and shipping management. The system uses PostgreSQL as the database, Gin as the HTTP framework, and follows Domain-Driven Design patterns.

## Development Commands

### Local Development
```bash
# Build the application
make build

# Clean build artifacts
make clean

# Run the application (builds and starts)
make run

# Run tests
make test
```

### Database Management
```bash
# Run database migrations up
make migrate_up

# Rollback database migrations
make migrate_down
```

### Docker Development
```bash
# Start all services with Docker
make docker-up

# Stop all services
make docker-down

# Start with management tools (Adminer, Redis Commander)
make docker-dev

# View application logs
make docker-app-logs

# Reset database with seed data
make docker-db-reset

# Create database backup
make docker-backup
```

### Docker Production
```bash
# Start production environment
make docker-prod-up

# Build production images
make docker-prod-build

# Stop production environment
make docker-prod-down
```

### Direct Commands
```bash
# Build manually
go build -o bin/malaka cmd/server/main.go

# Run tests with verbose output
go test ./... -v

# Run with race detection
go test -race ./...

# Run a specific test
go test ./internal/modules/masterdata/domain/entities -run TestArticle
```

### Hot Reload Development with Air
For fast development with automatic reloading, the project uses Air:

```bash
# Development with hot reload (recommended)
# This uses Docker Compose with Air for automatic backend reloading
docker-compose up --build

# Or using the development script
./dev.sh

# The air.toml configuration file controls the hot reload behavior:
# - Watches Go files for changes
# - Automatically rebuilds and restarts the server
# - Excludes vendor and test files
# - Uses PostgreSQL and Redis from Docker Compose
```

**Air Configuration** (`air.toml`):
- **Root**: `.` (project root)
- **Tmp Dir**: `tmp` (for temporary build files)
- **Build Command**: `go build -o ./tmp/main ./cmd/server/main.go`
- **Watch Patterns**: `**/*.go`, `**/*.yaml`, `**/*.yml`
- **Exclude Patterns**: `vendor/**`, `**/*_test.go`, `tmp/**`
- **Reload Delay**: 1000ms to prevent multiple rebuilds

## Architecture Overview

### Clean Architecture Structure
The codebase follows Clean Architecture with clear separation of concerns:

- **Domain Layer** (`domain/`): Business entities, repository interfaces, and domain services
- **Infrastructure Layer** (`infrastructure/`): External integrations and persistence implementations  
- **Presentation Layer** (`presentation/`): HTTP handlers, DTOs, and routing
- **Shared** (`shared/`): Common utilities, middleware, and cross-cutting concerns

### Module Organization
```
internal/modules/
├── masterdata/     # Core business data (articles, customers, suppliers, etc.)
├── inventory/      # Stock management, purchase orders, goods receipts
├── sales/          # Sales orders, invoices, POS transactions
├── finance/        # Accounting, payments, invoicing
└── shipping/       # Logistics and delivery management
```

### Key Directories
- `cmd/server/`: Application entry point and main.go
- `internal/config/`: Configuration management with Viper
- `internal/server/`: HTTP server setup and dependency injection
- `internal/shared/`: Reusable components (auth, database, logging, etc.)
- `internal/pkg/database/migrations/`: SQL migration files
- `api/openapi/`: OpenAPI specifications

## Database Configuration

- **Driver**: PostgreSQL
- **Default Connection**: `postgres://postgres:TanahAbang1971@localhost:5432/malaka`
- **Migration Tool**: Goose
- **Migration Path**: `./internal/pkg/database/migrations`

### Migration Guidelines
- **Schema Only**: Migration files should contain ONLY table structures, indexes, and constraints
- **No Sample Data**: NEVER include INSERT statements with sample/mock data in migration files
- **Production Safety**: Migration files run in all environments including production
- **Seed Files**: Use `./internal/pkg/database/seeds/` for optional development/testing data

## Environment Configuration

Configuration is managed through `app.env` file:
```
DB_DRIVER=postgres
DB_SOURCE=postgres://postgres:TanahAbang1971@localhost:5432/malaka?sslmode=disable
SERVER_ADDRESS=0.0.0.0:8080
```

## API Structure

The REST API follows modular organization with consistent versioning:
- Base URL: `http://localhost:8080`  
- API Version: All endpoints use `/api/v1` prefix for consistency
- Master Data: `/api/v1/masterdata/*` (companies, users, articles, customers, etc.)
- Inventory: `/api/v1/inventory/*` (purchase orders, stock movements, transfers)
- Shipping: `/api/v1/shipping/*` (couriers, shipments, airwaybills, manifests, invoices, outbound scans)
- Sales: `/api/v1/sales/*` (orders, invoices, POS transactions)
- Finance: `/api/v1/finance/*` (cash/bank management, payments, invoicing, accounts payable/receivable)
- Calendar: `/api/v1/calendar/*` (events, attendees, scheduling)
- HR: `/api/v1/hr/*` (employees, payroll, attendance)
- Accounting: `/api/v1/accounting/*` (general ledger, journal entries, trial balance)

### API Versioning Strategy

**IMPORTANT**: All new routes should be registered under `/api/v1` prefix for consistency:

```go
// ✅ CORRECT: Register routes with /api/v1 prefix
func (server *Server) setupRouter() {
    router := gin.Default()
    
    // Create API v1 group
    apiV1 := router.Group("/api/v1")
    
    // Register module routes under v1
    masterdata := apiV1.Group("/masterdata")
    inventory := apiV1.Group("/inventory") 
    shipping := apiV1.Group("/shipping")
    // ... other modules
}

// ❌ INCORRECT: Direct registration without versioning
func (server *Server) setupRouter() {
    router := gin.Default()
    
    // This creates inconsistent API structure
    masterdata := router.Group("/masterdata") // Missing /api/v1
}
```

**Current State**: The codebase has inconsistent API paths. Some modules use `/api` prefix (calendar), while others use direct paths. All new implementations should use `/api/v1` for consistency.

## Implementation Status

### Fully Implemented Modules (100%)
- **Master Data**: All 16 entities complete with full CRUD operations
  - Companies, Users, Articles, Customers, Classifications, Colors, Models, Sizes, Barcodes, Prices, Suppliers, Warehouses, Gallery Images, Courier Rates, Depstores, Divisions
- **Inventory**: All 13 features complete with full CRUD operations
  - Purchase Orders, Goods Receipts, Stock Management, Transfers, Draft Orders, Stock Adjustments, Stock Opname, Return Suppliers, Simple Goods Issue, Inventory Valuation
- **Shipping**: All 5 features complete with full CRUD operations
  - Couriers, Shipments, Airwaybills, Manifests, Outbound Scanning, Invoice Ekspedisi (with payment processing)
- **Sales**: All 11 features complete with full CRUD operations
  - Sales Orders, Sales Invoices, POS Transactions, Online Orders, Consignment Sales, Sales Returns, Promotions, Sales Targets, Sales Kompetitor, Proses Margin, Sales Rekonsiliasi
- **Finance**: All 14 features complete with full HTTP API
  - Cash/Bank Management, Payment Processing, Financial Invoicing, Accounts Payable/Receivable, Cash Receipts/Disbursements, Bank Transfers, Cash Opening Balances, Purchase Vouchers, Expenditure Requests, Check Clearance, Monthly Closing, Cash Book, Payment Processing

### Not Implemented
- **Accounting**: ⚠️ 1/16 features (Database schema implemented)
- **Payroll**: 0/12 features  
- **Attendance**: 0/5 features
- **Material**: 0/10 features
- **Integration/API**: 0/5 features
- **Reports**: 0/2 features

### Overall Progress: 60/122 features (49%) completed

## Development Patterns

### Repository Pattern
Each entity follows the repository pattern:
```go
type ArticleRepository interface {
    Create(ctx context.Context, article *entities.Article) error
    GetByID(ctx context.Context, id string) (*entities.Article, error)
    GetAll(ctx context.Context) ([]*entities.Article, error)
    Update(ctx context.Context, article *entities.Article) error
    Delete(ctx context.Context, id string) error
}
```

### Service Layer
Business logic is encapsulated in services:
```go
type ArticleService interface {
    CreateArticle(ctx context.Context, article *entities.Article) error
    GetArticleByID(ctx context.Context, id string) (*entities.Article, error)
    GetAllArticles(ctx context.Context) ([]*entities.Article, error)
    // ... other methods
}
```

### HTTP Handlers
Each handler follows standard patterns with proper error handling and response formatting.

## Testing
- Test files use `_test.go` suffix
- Unit tests for entities, repositories, services, and handlers
- Integration tests for database operations
- All major components have corresponding test files

## Data Management Guidelines

### Production Data Strategy
- **Real Data**: Use actual business data when possible (with proper anonymization for sensitive information)
- **Fictional Data**: If real data is not available, create realistic but clearly fictional data
- **No Brand Names**: Avoid using real company names, trademarks, or copyrighted material

### Migration vs Seed Data
- **Migrations**: Schema-only (tables, indexes, constraints). No INSERT statements.
- **Seed Files**: Optional sample data for development/testing environments only
- **Production**: Should start with clean, empty tables for user data entry

### Data Examples
```sql
-- ✅ GOOD: Migration file (schema only)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ GOOD: Seed file (fictional Indonesian data)
INSERT INTO companies (name) VALUES 
('PT Teknologi Contoh'),
('CV Dagang Contoh'),
('PT Sepatu Nusantara'),
('CV Perdagangan Jaya');

-- ❌ BAD: Real brand names or migration data
INSERT INTO companies (name) VALUES 
('PT Ramayana Lestari'),  -- Real company name
('PT Matahari Putra Prima'); -- Real company name
```

### Dummy Data Generation Requirements

**MANDATORY**: After implementing any new feature, create corresponding seed data files with realistic Indonesian dummy data:

#### **When to Generate Dummy Data:**
- After creating any new entity/table
- After completing CRUD operations for a feature
- When a feature is marked as "complete" in MODULE_CHECKLIST.md

#### **Indonesian Data Requirements:**
- **Company Names**: Use Indonesian business prefixes (PT, CV, UD, Koperasi)
- **Addresses**: Indonesian cities, streets, and postal codes
- **Phone Numbers**: Indonesian format (+62, 021, 031, etc.)
- **Names**: Indonesian names (Budi, Sari, Ahmad, Dewi, etc.)
- **Currency**: Indonesian Rupiah (IDR) amounts
- **Dates**: Appropriate Indonesian holidays and business dates

#### **Seed File Location:**
- Place all seed files in: `./internal/pkg/database/seeds/`
- File naming: `{table_name}.sql` (e.g., `companies.sql`, `articles.sql`)

#### **Data Volume Guidelines:**
- **Master Data**: 10-50 records per table
- **Transactional Data**: 100-500 records per table
- **Reference Data**: 5-20 records per table

#### **Example Indonesian Seed Data:**
```sql
-- companies.sql
INSERT INTO companies (name, address, phone, email) VALUES
('PT Sepatu Nusantara', 'Jl. Sudirman No. 123, Jakarta Pusat 10270', '021-5555-1234', 'info@sepatunusantara.co.id'),
('CV Dagang Jaya Abadi', 'Jl. Malioboro No. 456, Yogyakarta 55213', '0274-7777-5678', 'contact@dagangjaya.co.id'),
('UD Perdagangan Maju', 'Jl. Pahlawan No. 789, Surabaya 60119', '031-8888-9012', 'admin@perdagangmaju.co.id');

-- customers.sql
INSERT INTO customers (name, address, phone, city) VALUES
('Budi Santoso', 'Jl. Kebon Jeruk No. 12, Jakarta Barat', '021-1234-5678', 'Jakarta'),
('Sari Dewi', 'Jl. Malang No. 34, Bandung', '022-2345-6789', 'Bandung'),
('Ahmad Hidayat', 'Jl. Pemuda No. 56, Semarang', '024-3456-7890', 'Semarang');

-- articles.sql (for shoe products)
INSERT INTO articles (code, name, description, price, category) VALUES
('SEP001', 'Sepatu Pantofel Kulit', 'Sepatu formal kulit asli untuk pria', 450000, 'Formal'),
('SEP002', 'Sepatu Sneakers Casual', 'Sepatu olahraga nyaman untuk sehari-hari', 320000, 'Casual'),
('SEP003', 'Sepatu Boots Kerja', 'Sepatu boots tahan lama untuk pekerja', 580000, 'Safety');

-- shipping_invoices.sql (for shipping invoice data)
INSERT INTO shipping_invoices (invoice_number, origin, destination, weight, base_rate, total_amount, status) VALUES
('SI20250718001', 'Jakarta', 'Surabaya', 2.5, 25000.00, 30250.00, 'PENDING'),
('SI20250718002', 'Bandung', 'Medan', 1.8, 35000.00, 40150.00, 'PAID'),
('SI20250718003', 'Yogyakarta', 'Denpasar', 3.2, 45000.00, 52800.00, 'OVERDUE');
```

## Key Dependencies
- **Gin**: HTTP framework
- **Viper**: Configuration management  
- **Zap**: Structured logging
- **lib/pq**: PostgreSQL driver
- **JWT-Go**: Authentication
- **Redis**: Caching
- **Goose**: Database migrations

## Docker Configuration
- **PostgreSQL 15**: Primary database with automatic migrations
- **Redis 7**: Caching and session storage
- **Multi-stage Dockerfile**: Optimized for production
- **Docker Compose**: Development and production environments
- **Health Checks**: Automated service monitoring
- **Volume Persistence**: Data retention across container restarts
- **Management Tools**: Adminer (PostgreSQL) and Redis Commander