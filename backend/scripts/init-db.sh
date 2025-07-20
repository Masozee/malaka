#!/bin/bash
set -e

# Database initialization script for MALAKA ERP
echo "Starting database initialization..."

# Set PostgreSQL environment variables
export PGUSER="postgres"
export PGDATABASE="malaka"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h localhost -p 5432 -U postgres; do
  echo "PostgreSQL is not ready yet. Waiting..."
  sleep 2
done

echo "PostgreSQL is ready! Starting database setup..."

# Create database if it doesn't exist
echo "Creating database if it doesn't exist..."
psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'malaka'" | grep -q 1 || psql -h localhost -U postgres -c "CREATE DATABASE malaka;"

# Connect to the malaka database
echo "Connecting to malaka database..."
export PGDATABASE="malaka"

# Create UUID extension if it doesn't exist
echo "Creating UUID extension..."
psql -h localhost -U postgres -d malaka -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Run migrations in order
echo "Running database migrations..."
for migration_file in /docker-entrypoint-initdb.d/migrations/*.sql; do
    if [ -f "$migration_file" ]; then
        echo "Running migration: $(basename "$migration_file")"
        psql -h localhost -U postgres -d malaka -f "$migration_file"
    fi
done

# Check if we should load seed data (only in development)
if [ "$LOAD_SEED_DATA" = "true" ]; then
    echo "Loading seed data..."
    
    # Load seed data files if they exist
    SEED_DIR="/docker-entrypoint-initdb.d/seeds"
    if [ -d "$SEED_DIR" ]; then
        for seed_file in "$SEED_DIR"/*.sql; do
            if [ -f "$seed_file" ]; then
                echo "Loading seed data: $(basename "$seed_file")"
                psql -h localhost -U postgres -d malaka -f "$seed_file" || {
                    echo "Warning: Failed to load seed data from $(basename "$seed_file")"
                }
            fi
        done
    else
        echo "Seed directory not found, skipping seed data loading"
    fi
else
    echo "Skipping seed data loading (LOAD_SEED_DATA not set to true)"
fi

# Create indexes for better performance
echo "Creating additional indexes..."
psql -h localhost -U postgres -d malaka << EOF
-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_code ON articles(code);
CREATE INDEX IF NOT EXISTS idx_articles_name ON articles(name);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- Composite indexes for common join queries
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_date ON purchase_orders(supplier_id, created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_article_date ON stock_movements(article_id, created_at);
CREATE INDEX IF NOT EXISTS idx_shipping_invoices_status_date ON shipping_invoices(status, created_at);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_articles_name_trgm ON articles USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_customers_name_trgm ON customers USING gin (name gin_trgm_ops);

-- Enable trigram extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
EOF

# Verify database setup
echo "Verifying database setup..."
TABLE_COUNT=$(psql -h localhost -U postgres -d malaka -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
echo "Database setup complete! Created $TABLE_COUNT tables."

# Show database summary
echo "Database summary:"
psql -h localhost -U postgres -d malaka -c "
SELECT 
    schemaname,
    tablename,
    attname,
    typname,
    attnum
FROM pg_tables t
JOIN pg_attribute a ON a.attrelid = (quote_ident(t.schemaname)||'.'||quote_ident(t.tablename))::regclass
JOIN pg_type ty ON ty.oid = a.atttypid
WHERE schemaname = 'public' 
AND attnum > 0
AND NOT attisdropped
ORDER BY tablename, attnum;
"

echo "Database initialization completed successfully!"