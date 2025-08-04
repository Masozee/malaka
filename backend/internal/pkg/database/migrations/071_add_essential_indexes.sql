-- +goose Up
-- Essential Performance Indexes - Only the most critical ones we're sure exist

-- Articles table indexes (confirmed structure)
CREATE INDEX IF NOT EXISTS idx_articles_classification_id ON articles(classification_id);
CREATE INDEX IF NOT EXISTS idx_articles_color_id ON articles(color_id);
CREATE INDEX IF NOT EXISTS idx_articles_model_id ON articles(model_id);
CREATE INDEX IF NOT EXISTS idx_articles_size_id ON articles(size_id);
CREATE INDEX IF NOT EXISTS idx_articles_supplier_id ON articles(supplier_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_name ON articles(name);

-- Stock balances indexes (critical for inventory)
CREATE INDEX IF NOT EXISTS idx_stock_balances_article_id ON stock_balances(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_balances_warehouse_id ON stock_balances(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_balances_article_warehouse ON stock_balances(article_id, warehouse_id);

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Supplier indexes  
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Full-text search for names
CREATE INDEX IF NOT EXISTS idx_articles_name_search ON articles USING gin(to_tsvector('indonesian', name));
CREATE INDEX IF NOT EXISTS idx_customers_name_search ON customers USING gin(to_tsvector('indonesian', name));

-- +goose Down
DROP INDEX IF EXISTS idx_customers_name_search;
DROP INDEX IF EXISTS idx_articles_name_search;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_suppliers_name;
DROP INDEX IF EXISTS idx_customers_phone;
DROP INDEX IF EXISTS idx_customers_name;
DROP INDEX IF EXISTS idx_stock_balances_article_warehouse;
DROP INDEX IF EXISTS idx_stock_balances_warehouse_id;
DROP INDEX IF EXISTS idx_stock_balances_article_id;
DROP INDEX IF EXISTS idx_articles_name;
DROP INDEX IF EXISTS idx_articles_created_at;
DROP INDEX IF EXISTS idx_articles_supplier_id;
DROP INDEX IF EXISTS idx_articles_size_id;
DROP INDEX IF EXISTS idx_articles_model_id;
DROP INDEX IF EXISTS idx_articles_color_id;
DROP INDEX IF EXISTS idx_articles_classification_id;