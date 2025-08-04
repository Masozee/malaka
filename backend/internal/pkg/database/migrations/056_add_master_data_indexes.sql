-- +goose Up
-- +goose StatementBegin

-- Companies table indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Additional search performance indexes (removed trigram indexes - requires pg_trgm extension)

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_divisions_level_parent ON divisions(level, parent_id);
CREATE INDEX IF NOT EXISTS idx_depstores_status_city ON depstores(status, city);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Drop all created indexes
DROP INDEX IF EXISTS idx_companies_name;
DROP INDEX IF EXISTS idx_companies_created_at;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_company_id;
DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_customers_name;
DROP INDEX IF EXISTS idx_customers_phone;
DROP INDEX IF EXISTS idx_customers_status;
DROP INDEX IF EXISTS idx_customers_created_at;
DROP INDEX IF EXISTS idx_divisions_level_parent;
DROP INDEX IF EXISTS idx_depstores_status_city;

-- +goose StatementEnd