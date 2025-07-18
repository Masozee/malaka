## Project Overview

Malaka is a Go-based ERP (Enterprise Resource Planning) system built with Clean Architecture principles. It provides comprehensive business modules for master data, inventory, sales, finance, and shipping management. The system uses PostgreSQL as the database, Gin as the HTTP framework, and follows Domain-Driven Design patterns.

## Development Commands

### Build and Run
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

The REST API follows modular organization:
- Base URL: `http://localhost:8080`
- Master Data: `/masterdata/*` (companies, users, articles, customers, etc.)
- Inventory: `/inventory/*` (purchase orders, stock movements, transfers)
- Sales: `/sales/*` (orders, invoices, POS transactions)

## Implementation Status

### Fully Implemented Modules
- **Master Data**: Companies, Users, Articles, Customers, Classifications, Colors
- **Inventory**: Purchase Orders (complete), Stock Management (partial)

### Partially Implemented
- Master Data entities (Models, Sizes, Barcodes, etc.) - missing handler GetAll methods
- Inventory module - missing service/handler methods for some entities
- Sales module - routes defined, full implementation needed

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
```

## Key Dependencies
- **Gin**: HTTP framework
- **Viper**: Configuration management
- **Zap**: Structured logging
- **lib/pq**: PostgreSQL driver
- **JWT-Go**: Authentication
- **Redis**: Caching
- **Goose**: Database migrations