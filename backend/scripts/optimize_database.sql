-- =============================================================================
-- Malaka ERP Database Optimization Script
-- =============================================================================
-- Run this script as superuser: psql -U postgres -d malaka -f optimize_database.sql
-- =============================================================================

-- 1. POSTGRESQL CONFIGURATION (requires superuser)
-- Note: These require pg_reload_conf() or restart to take effect
-- =============================================================================

-- Memory Settings (adjust based on your RAM)
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET work_mem = '64MB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- SSD Optimizations
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Parallel Query
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;
ALTER SYSTEM SET max_parallel_maintenance_workers = 4;

-- WAL/Checkpoint (reduces I/O spikes)
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET checkpoint_timeout = '15min';
ALTER SYSTEM SET max_wal_size = '4GB';
ALTER SYSTEM SET wal_buffers = '64MB';

-- Autovacuum (aggressive for better performance)
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.05;
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.02;
ALTER SYSTEM SET autovacuum_vacuum_cost_delay = '2ms';
ALTER SYSTEM SET autovacuum_vacuum_cost_limit = 1000;
ALTER SYSTEM SET autovacuum_naptime = '30s';

-- Logging slow queries (for monitoring)
ALTER SYSTEM SET log_min_duration_statement = 100;

-- Apply configuration changes
SELECT pg_reload_conf();

-- =============================================================================
-- 2. ANALYZE ALL TABLES (Update statistics for query planner)
-- =============================================================================
ANALYZE VERBOSE;

-- =============================================================================
-- 3. VACUUM FULL ON HIGH-WRITE TABLES (reclaim space, rewrite tables)
-- Run during maintenance window only!
-- =============================================================================
-- VACUUM FULL ANALYZE procurement_purchase_orders;
-- VACUUM FULL ANALYZE procurement_purchase_order_items;
-- VACUUM FULL ANALYZE stock_movements;
-- VACUUM FULL ANALYZE journal_entries;
-- VACUUM FULL ANALYZE journal_entry_lines;

-- =============================================================================
-- 4. ENABLE EXTENSIONS FOR OPTIMIZATION
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;        -- Trigram similarity for LIKE
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;  -- Query statistics

-- =============================================================================
-- 5. CREATE STATISTICS FOR MULTI-COLUMN QUERIES
-- =============================================================================
-- These help the planner make better decisions for multi-column filters

-- Procurement
CREATE STATISTICS IF NOT EXISTS stat_proc_po_supplier_status
    ON supplier_id, status FROM procurement_purchase_orders;

CREATE STATISTICS IF NOT EXISTS stat_purchase_requests_status_priority
    ON status, priority FROM purchase_requests;

-- Inventory
CREATE STATISTICS IF NOT EXISTS stat_stock_movements_article_warehouse
    ON article_id, warehouse_id FROM stock_movements;

CREATE STATISTICS IF NOT EXISTS stat_goods_receipts_po_warehouse
    ON purchase_order_id, warehouse_id FROM goods_receipts;

-- Sales
CREATE STATISTICS IF NOT EXISTS stat_sales_orders_customer_status
    ON customer_id, status FROM sales_orders;

-- Accounting
CREATE STATISTICS IF NOT EXISTS stat_journal_entries_company_date
    ON company_id, entry_date FROM journal_entries;

-- Analyze to update the new statistics
ANALYZE;

-- =============================================================================
-- 6. MONITORING QUERIES - Run these to check performance
-- =============================================================================

-- Check slow queries (requires pg_stat_statements)
-- SELECT query, calls, mean_exec_time, rows
-- FROM pg_stat_statements
-- ORDER BY mean_exec_time DESC LIMIT 20;

-- Check table bloat
-- SELECT schemaname, relname, n_live_tup, n_dead_tup,
--        round(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_pct
-- FROM pg_stat_user_tables
-- WHERE n_dead_tup > 100
-- ORDER BY n_dead_tup DESC;

-- Check index usage
-- SELECT schemaname, relname, indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC LIMIT 20;

-- Check cache hit ratio (should be > 99%)
-- SELECT
--     sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100 as cache_hit_ratio
-- FROM pg_statio_user_tables;

-- =============================================================================
-- 7. PRINT SUMMARY
-- =============================================================================
\echo ''
\echo '============================================='
\echo 'Database optimization complete!'
\echo '============================================='
\echo ''
\echo 'IMPORTANT: Restart PostgreSQL for memory settings to take full effect:'
\echo '  brew services restart postgresql@15'
\echo ''
\echo 'Monitor performance with:'
\echo '  SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;'
\echo ''
