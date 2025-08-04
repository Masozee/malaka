-- Database Health Check Script
-- Run this before and after optimization to compare

\echo '🏥 DATABASE HEALTH CHECK'
\echo '========================'

\echo ''
\echo '📊 Database Size Information'
\echo '----------------------------'
SELECT 
    pg_size_pretty(pg_database_size('malaka')) as database_size;

\echo ''
\echo '📋 Table Row Counts'
\echo '------------------'
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables 
WHERE n_live_tup > 0
ORDER BY n_live_tup DESC
LIMIT 15;

\echo ''
\echo '🔍 Index Usage Statistics'
\echo '------------------------'
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE idx_scan > 0
ORDER BY idx_scan DESC
LIMIT 10;

\echo ''
\echo '⚠️  Missing Indexes (Tables without indexes on foreign keys)'
\echo '-----------------------------------------------------------'
SELECT DISTINCT
    t.table_name,
    kcu.column_name as foreign_key_column
FROM information_schema.table_constraints t
JOIN information_schema.key_column_usage kcu ON t.constraint_name = kcu.constraint_name
WHERE t.constraint_type = 'FOREIGN KEY'
  AND t.table_schema = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes i 
    WHERE i.tablename = t.table_name 
    AND i.indexdef LIKE '%' || kcu.column_name || '%'
  )
ORDER BY t.table_name, kcu.column_name;

\echo ''
\echo '🐌 Potentially Slow Queries (if pg_stat_statements is enabled)'
\echo '-------------------------------------------------------------'
SELECT 
    LEFT(query, 80) as query_start,
    calls,
    ROUND(mean_time::numeric, 2) as avg_time_ms,
    ROUND(total_time::numeric, 2) as total_time_ms
FROM pg_stat_statements 
WHERE calls > 10 
ORDER BY mean_time DESC 
LIMIT 10;

\echo ''
\echo '🔗 Connection Information'
\echo '------------------------'
SELECT 
    state,
    COUNT(*) as connection_count,
    MAX(EXTRACT(EPOCH FROM (now() - state_change))) as max_age_seconds
FROM pg_stat_activity 
WHERE datname = 'malaka'
GROUP BY state
ORDER BY connection_count DESC;

\echo ''
\echo '💾 Cache Hit Ratio (should be > 95%)'
\echo '-----------------------------------'
SELECT 
    'Buffer Cache Hit Ratio' as metric,
    ROUND(
        (sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read) + 0.000001)) * 100, 
        2
    ) as percentage
FROM pg_statio_user_tables;

\echo ''
\echo '✅ Health check complete!'
\echo '========================'