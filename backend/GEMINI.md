# Malaka ERP Project - Gemini Agent Guide

This document provides a comprehensive guide for the Gemini agent to work on the Malaka ERP project. It consolidates information from multiple project documents.

## 1. Project Overview

- **Project Name**: Malaka ERP
- **Description**: A Go-based ERP system for YONGKI KOMALADI, built with Clean Architecture principles. It covers master data, inventory, sales, finance, shipping, and more.
- **Primary Language**: Go
- **Database**: PostgreSQL
- **Framework**: Gin

## 2. Development Commands & Environment

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

# Run tests with verbose output and race detection
go test ./... -v -race
```

### Database Management
```bash
# Run database migrations up
make migrate_up

# Rollback database migrations
make migrate_down
```

### Docker Environment
```bash
# Start all services with Docker
make docker-up

# Stop all services
make docker-down

# View application logs
make docker-app-logs

# Reset database with seed data
make docker-db-reset
```

### Database Configuration
- **Driver**: PostgreSQL
- **User**: `postgres`
- **Password**: `TanahAbang1971`
- **DB Name**: `malaka`
- **Connection String**: `postgres://postgres:TanahAbang1971@localhost:5432/malaka?sslmode=disable`
- **Migration Tool**: Goose
- **Migration Path**: `./internal/pkg/database/migrations`

## 3. Architecture & Structure

### Clean Architecture
The project follows a strict Clean Architecture:
- **Domain Layer** (`domain/`): Entities, repository interfaces, and domain services.
- **Infrastructure Layer** (`infrastructure/`): Persistence (database) and external service integrations.
- **Presentation Layer** (`presentation/`): HTTP handlers, DTOs, and routing.
- **Shared** (`shared/`): Cross-cutting concerns like auth, logging, database connections, etc.

### Module Organization
The application is divided into modules located in `internal/modules/`:
- `masterdata`: Core business data (articles, customers, suppliers).
- `inventory`: Stock management, purchase orders, goods receipts.
- `sales`: Sales orders, invoices, POS transactions.
- `shipping`: Couriers, shipments, airwaybills, manifests.
- `finance`: Accounting, payments, invoicing.
- `payroll`: Employee and salary management.
- `accounting`: General ledger, financial reporting.

## 4. Development Plan (Batches)

Development is broken into 5 batches. Follow this sequence strictly.

### BATCH 1: Foundation & Core Infrastructure
- **Goal**: Set up the foundation, shared components, and basic master data (Company, User, Classification, Color).
- **Key Files**: `cmd/server/main.go`, `internal/config`, `internal/shared`, `internal/server`, basic master data modules.

### BATCH 2: Complete Master Data & Article Management
- **Goal**: Complete all master data modules, including Article, Model, Size, Barcode, Price, Supplier, etc.
- **Key Features**: Image uploads, barcode generation, event-driven architecture, Redis caching.

### BATCH 3: Inventory & Purchase Management
- **Goal**: Build the complete inventory control system.
- **Key Features**: Purchase Orders, Goods Receipts, Stock Movements, Transfers, Adjustments, background jobs for stock calculation.

### BATCH 4: Sales & Financial Management
- **Goal**: Build sales, shipping, and basic financial systems.
- **Key Features**: Sales Orders, Invoices, POS, Marketplace Integration, Payment Gateways, Shipping/Courier integration.

### BATCH 5: Accounting, Payroll & Advanced Features
- **Goal**: Complete the ERP with high-level modules.
- **Key Features**: Chart of Accounts, General Ledger, Financial Reports, Payroll, Attendance, Advanced Reporting (OLAP).

*(For detailed file structures and prompts for each batch, refer to the original `docs/STRUCTURE.md`)*

## 5. Module Implementation Checklist

**Overall Progress: 60/122 features (49%) completed**

- **Master Data**: ✅ 100% Complete (16/16)
- **Inventory Control**: ✅ 100% Complete (13/13)
- **Shipping**: ✅ 100% Complete (5/5)
- **Sales**: ✅ 100% Complete (11/11)
- **Finance**: ✅ 100% Complete (14/14)
- **Accounting**: ⚠️ 1/16 Partially Implemented
- **Payroll**: ❌ 0% Complete (0/12)
- **Attendance**: ❌ 0% Complete (0/5)
- **Material**: ❌ 0% Complete (0/10)
- **Integration/API**: ❌ 0% Complete (0/5)
- **Reports**: ❌ 0% Complete (0/2)

**Priority Action Item:** Begin accounting module development (Chart of Accounts, General Ledger foundation).

## 6. Data Management & Localization

### Indonesian Localization
- **Currency**: Indonesian Rupiah (IDR).
- **Tax**: Use **PPN** (Pajak Pertambahan Nilai).
- **Data**: All seed/test data must be localized for Indonesia (names, addresses, company names, phone numbers, etc.).

### Migration vs. Seed Data
- **Migrations**: **SCHEMA ONLY**. Contain `CREATE TABLE`, `ALTER TABLE`, etc. **NEVER** include `INSERT` statements.
- **Seed Files**: **DATA ONLY**. Located in `./internal/pkg/database/seeds/`. Used for development and testing.
- **Dummy Data**: **MANDATORY** to create realistic Indonesian seed data for every new feature.

### Example Seed Data
```sql
-- companies.sql
INSERT INTO companies (name, address, phone, email) VALUES
('PT Sepatu Nusantara Jaya', 'Jl. Sudirman No. 123, Jakarta Pusat 10270', '021-5555-1234', 'info@sepatunusantara.co.id');

-- articles.sql (shoe products)
INSERT INTO articles (code, name, description, price, category) VALUES
('SEP001', 'Sepatu Pantofel Kulit Hitam', 'Sepatu formal kulit asli untuk pria', 450000, 'Formal');
```

## 7. Concurrency & Goroutines

The project uses goroutines for:
- **Job Queue System**: A worker pool for background jobs.
- **Event Dispatcher**: Asynchronous, non-blocking event handling.
- **Cache Cleanup**: Background worker for in-memory cache.

**Recommendations for new features:**
- **Database Batch Processing**: Use a pipeline pattern for large data imports/updates.
- **Real-time Stock Monitoring**: A dedicated goroutine with a ticker to check stock levels.
- **Concurrent Report Generation**: Use a semaphore to limit concurrent report jobs.
- **Async Email/Notifications**: A worker pool to send notifications without blocking.

## 8. Security

- **Authentication**: Use JWT with bcrypt for password hashing.
- **Authorization**: Implement Role-Based Access Control (RBAC).
- **API Security**: Validate all incoming requests, sanitize inputs to prevent SQL injection.
- **Dependencies**: Audit dependencies with `govulncheck`.
- **Secrets**: Manage secrets using environment variables (`app.env`) or a secrets manager. Do not hardcode credentials.
- **Testing**: Run `gosec` and `staticcheck` regularly.

## 9. Instructions for Gemini Agent

1.  **Follow the Batches**: Adhere strictly to the development plan outlined in Section 4.
2.  **TDD is Mandatory**: For any new file, create the `_test.go` file first. Do not proceed until all tests for the current file pass.
3.  **Verify File Existence**: Before creating a file, use `find` to check if it already exists. If it does, read it first.
4.  **Generate Indonesian Dummy Data**: This is a **CRITICAL REQUIREMENT**. After implementing any new feature, create a corresponding seed file in `./internal/pkg/database/seeds/` with 10-50 records of realistic Indonesian data.
5.  **Integration Testing with Seed Data**: For integration tests, ensure the database is populated with relevant seed data from `./internal/pkg/database/seeds/` before running tests. Use `make docker-db-reset` to reset and seed the database.
6.  **Adhere to Architecture**: Strictly follow the Clean Architecture and module structure.
7.  **Handle Dependencies**: Pay close attention to the dependency injection in the container. The current main blocker is missing service registrations.
8.  **Use Provided Commands**: Utilize the `Makefile` commands for building, testing, and running the application.