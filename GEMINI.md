# Malaka ERP Project

This document outlines the development plan and guidelines for the Malaka ERP system.

## 1. Project Overview

- **Project Name**: Malaka ERP
- **Description**: A backend ERP system for YONGKI KOMALADI.
- **Primary Documentation**: The development process is broken down into 5 distinct batches, as detailed in `erp_project_batches.md`. This document provides the complete file structure, scope for each batch, and prompts for AI-driven code generation.

## 2. Technology Stack

- **Programming Language**: Go (latest version)
- **Database**: PostgreSQL

## 3. Database Configuration

- **Username**: `postgres`
- **Password**: `TanahAbang1971`
- **Database Name**: `malaka`

The application should be configured to connect to the PostgreSQL database using these credentials and operate on the `malaka` database.

## 4. Development Workflow & Testing

This project follows a strict **Test-Driven Development (TDD)** methodology.

- **Test-First Approach**: For any new file or module, a corresponding unit test file must be created first.
- **Mandatory Testing**: Write comprehensive unit tests for all business logic, repository functions, and handlers.
- **Sequential Progression**: **Do not proceed to the next file or development task until all tests for the current file pass successfully.** This is a critical rule to ensure code quality, maintainability, and correctness at every step.

## 5. Localization & Customization

- **Currency**: All financial values must be handled in Indonesian Rupiah (IDR).
- **Tax**: The standard tax will be referred to as **PPN** (Pajak Pertambahan Nilai).
- **Data Localization**: All seed data, examples, and test data (e.g., user names, addresses, company names, product descriptions) must be localized for the Indonesian context.

## 6. Data Management Guidelines

### Production-Grade Data Strategy
- **Real Data**: Use actual business data when possible (properly anonymized for sensitive information)
- **Fictional Data**: If real data is not available, create realistic but clearly fictional Indonesian data
- **No Brand Names**: NEVER use real company names, trademarks, or copyrighted material
- **Legal Safety**: Avoid any data that could cause intellectual property or trademark issues

### Migration vs Seed Data Separation
- **Migration Files**: ONLY contain database schema (tables, indexes, constraints)
- **NO Sample Data in Migrations**: NEVER include INSERT statements in migration files
- **Seed Files**: Use `./internal/pkg/database/seeds/` for optional development/testing data
- **Production Deployment**: Migration files run in all environments; seed files are optional

### Data Examples
```sql
-- ✅ GOOD: Migration file (schema only)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ GOOD: Seed file with fictional Indonesian data
INSERT INTO companies (name, address) VALUES 
('PT Teknologi Contoh', 'Jl. Sample No. 123, Jakarta Pusat'),
('CV Dagang Contoh', 'Jl. Example No. 456, Surabaya'),
('UD Sepatu Nusantara', 'Jl. Sudirman No. 789, Bandung'),
('Koperasi Perdagangan Jaya', 'Jl. Pahlawan No. 321, Yogyakarta');

-- ❌ BAD: Real brand names or companies
INSERT INTO companies (name, address) VALUES 
('PT Ramayana Lestari', '...'),  -- Real company
('PT Matahari Putra Prima', '...'); -- Real company
```

## 7. Dummy Data Generation Requirements

**CRITICAL REQUIREMENT**: After implementing any new feature, you MUST create corresponding seed data files with realistic Indonesian dummy data.

### **When to Generate Dummy Data:**
- **Immediately after** creating any new entity/table
- **After completing** CRUD operations for a feature
- **Before marking** a feature as "complete" in docs/MODULE_CHECKLIST.md
- **During testing** to verify the feature works with realistic data

### **Indonesian Localization Standards:**

#### **Company Names:**
- Use proper Indonesian business entity prefixes:
  - **PT** (Perseroan Terbatas) - Limited Company
  - **CV** (Comanditaire Vennootschap) - Limited Partnership
  - **UD** (Usaha Dagang) - Trading Business
  - **Koperasi** - Cooperative
- Examples: `PT Sepatu Nusantara`, `CV Dagang Jaya Abadi`

#### **Personal Names:**
- Use authentic Indonesian names:
  - **Male**: Budi, Ahmad, Andi, Rizky, Dedi, Hadi, Rudi
  - **Female**: Sari, Dewi, Rina, Maya, Fitri, Indra, Wulan
- Full names: `Budi Santoso`, `Sari Dewi Lestari`, `Ahmad Hidayat`

#### **Addresses:**
- Use real Indonesian cities and proper address format:
  - **Format**: `Jl. [Street Name] No. [Number], [Area], [City] [Postal Code]`
  - **Cities**: Jakarta, Surabaya, Bandung, Medan, Semarang, Yogyakarta
  - **Examples**: `Jl. Sudirman No. 123, Jakarta Pusat 10270`

#### **Phone Numbers:**
- Use proper Indonesian phone formats:
  - **Jakarta**: `021-xxxx-xxxx`
  - **Surabaya**: `031-xxxx-xxxx`
  - **Bandung**: `022-xxxx-xxxx`
  - **Mobile**: `0812-xxxx-xxxx`, `0813-xxxx-xxxx`
  - **International**: `+62-21-xxxx-xxxx`

#### **Currency and Pricing:**
- Use Indonesian Rupiah (IDR) realistic amounts:
  - **Shoes**: 200,000 - 1,500,000 IDR
  - **Clothing**: 50,000 - 500,000 IDR
  - **Electronics**: 500,000 - 10,000,000 IDR

#### **Product Names (for Shoe ERP):**
- Use Indonesian shoe terminology:
  - `Sepatu Pantofel Kulit` (Leather Dress Shoes)
  - `Sepatu Sneakers Casual` (Casual Sneakers)  
  - `Sepatu Boots Kerja` (Work Boots)
  - `Sepatu Sandal Pria` (Men's Sandals)
  - `Sepatu Hak Tinggi Wanita` (Women's High Heels)

### **Seed File Organization:**
- **Location**: `./internal/pkg/database/seeds/`
- **Naming**: `{table_name}.sql` (e.g., `companies.sql`, `customers.sql`)
- **Volume**: 10-50 records per master data table

### **Example Indonesian Seed Files:**

```sql
-- companies.sql
INSERT INTO companies (name, address, phone, email) VALUES
('PT Sepatu Nusantara Jaya', 'Jl. Sudirman No. 123, Jakarta Pusat 10270', '021-5555-1234', 'info@sepatunusantara.co.id'),
('CV Dagang Sepatu Abadi', 'Jl. Malioboro No. 456, Yogyakarta 55213', '0274-7777-5678', 'contact@dagangsepatu.co.id'),
('UD Perdagangan Maju Bersama', 'Jl. Pahlawan No. 789, Surabaya 60119', '031-8888-9012', 'admin@perdagangmaju.co.id');

-- customers.sql  
INSERT INTO customers (name, address, phone, city) VALUES
('Budi Santoso', 'Jl. Kebon Jeruk No. 12, Jakarta Barat', '021-1234-5678', 'Jakarta'),
('Sari Dewi Lestari', 'Jl. Malang No. 34, Bandung', '022-2345-6789', 'Bandung'),
('Ahmad Hidayat', 'Jl. Pemuda No. 56, Semarang', '024-3456-7890', 'Semarang'),
('Dewi Ratnasari', 'Jl. Diponegoro No. 78, Yogyakarta', '0274-4567-8901', 'Yogyakarta');

-- articles.sql (shoe products)
INSERT INTO articles (code, name, description, price, category) VALUES
('SEP001', 'Sepatu Pantofel Kulit Hitam', 'Sepatu formal kulit asli untuk pria warna hitam', 450000, 'Formal'),
('SEP002', 'Sepatu Sneakers Casual Putih', 'Sepatu olahraga nyaman untuk sehari-hari', 320000, 'Casual'),
('SEP003', 'Sepatu Boots Kerja Safety', 'Sepatu boots tahan lama untuk pekerja konstruksi', 580000, 'Safety'),
('SEP004', 'Sepatu Hak Tinggi Wanita', 'Sepatu hak tinggi elegan untuk wanita', 385000, 'Formal'),
('SEP005', 'Sepatu Sandal Pria Kulit', 'Sandal kulit casual untuk pria', 175000, 'Casual');
```

## 8. Instructions for Gemini Agent

1.  **Follow the Batches**: Adhere strictly to the development plan outlined in `docs/MODULE_CHECKLIST.md`. Begin with Batch 1 and proceed sequentially.
2.  **Implement TDD**: For each file you create or modify, you must first create/update the corresponding test file (e.g., `user_service_test.go` for `user_service.go`). Write the tests, watch them fail, and then write the implementation code to make them pass.
3.  **Verify Continuously**: After implementing a feature or a file, run the relevant tests to ensure that your changes are correct and have not introduced any regressions.
4.  **File Verification**: Before creating or modifying files, verify their existence using bash commands:
    ```bash
    # Check if specific file exists
    find /Users/pro/Dev/malaka -name "filename.go" -type f
    
    # If file not found, proceed with creation
    # If file exists, read it first before modification
    
    # Examples for specific files:
    find /Users/pro/Dev/malaka -name "goods_issue_service.go" -type f
    find /Users/pro/Dev/malaka -name "user_service.go" -type f
    find /Users/pro/Dev/malaka -name "article_handler.go" -type f
    
    # Search for patterns:
    find /Users/pro/Dev/malaka -name "*_service.go" -type f
    find /Users/pro/Dev/malaka -name "*_handler.go" -type f
    find /Users/pro/Dev/malaka -name "*_repository.go" -type f
    
    # Search in specific directories:
    find /Users/pro/Dev/malaka -path "*/services/*" -name "*.go" -type f
    find /Users/pro/Dev/malaka -path "*/handlers/*" -name "*_handler.go" -type f
    find /Users/pro/Dev/malaka -path "*/repositories/*" -name "*_repository.go" -type f
    find /Users/pro/Dev/malaka -path "*/entities/*" -name "*.go" -type f
    
    # Check for migration files:
    find /Users/pro/Dev/malaka -path "*/migrations/*" -name "*.sql" -type f
    find /Users/pro/Dev/malaka -path "*/seeds/*" -name "*.sql" -type f
    
    # Verify directory structure:
    ls -la /Users/pro/Dev/malaka/internal/modules/
    ls -la /Users/pro/Dev/malaka/internal/pkg/database/
    
    # Common troubleshooting commands:
    # If compilation fails, check for orphaned or incomplete files
    find /Users/pro/Dev/malaka -name "*.go" -type f -empty
    find /Users/pro/Dev/malaka -name "*_service.go" -type f -exec grep -l "undefined\|incomplete" {} \;
    
    # Clean up empty or problematic files:
    # (Only use after verification)
    # rm /path/to/problematic/file.go
    ```
    
    **File Management Workflow:**
    1. Use `find` command to check if file exists
    2. If exists, use `Read` tool to examine content
    3. If not found or empty, proceed with creation
    4. If incomplete, complete or remove the file
    5. Always test compilation after changes
5.  **Incorporate Localization**: Ensure all currency, tax, and data implementations follow the localization guidelines in Section 5.
6.  **Follow Data Guidelines**: Strictly adhere to the data management guidelines in Section 6:
    - NEVER put sample data in migration files
    - Use fictional Indonesian data in seed files
    - Avoid real company names or trademarks
    - Separate schema (migrations) from data (seeds)
7.  **Generate Indonesian Dummy Data**: MANDATORY requirement from Section 7:
    - Create seed files for every new feature/table
    - Use authentic Indonesian names, addresses, phone numbers
    - Include realistic IDR pricing for shoe products
    - Follow proper Indonesian business naming conventions
    - Generate 10-50 records per master data table
8.  **Use Provided Prompts**: The `docs/HOW-TO.md` document contains specific prompts for generating code for each batch. Use these as a guide to understand the scope and requirements.
9.  **Adhere to Architecture**: Follow the clean architecture structure (domain, infrastructure, presentation) as defined in the project documentation and update the CHECKLIST.md.
10. **List and Detail**: Always Create list and detail of each data.