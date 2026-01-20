-- Stock Balance Seed Data
-- This creates stock balance entries linking articles to warehouses with quantities

INSERT INTO stock_balances (article_id, warehouse_id, quantity, created_at, updated_at)
SELECT
    a.id,
    w.id,
    floor(random() * 200 + 50)::int,
    NOW(),
    NOW()
FROM articles a
CROSS JOIN warehouses w
WHERE w.code IN ('WH-JKT-001', 'WH-SBY-001', 'WH-BDG-001')
ON CONFLICT DO NOTHING;

-- Add some specific stock levels for variety
INSERT INTO stock_balances (article_id, warehouse_id, quantity, created_at, updated_at)
SELECT
    a.id,
    w.id,
    floor(random() * 100 + 10)::int,
    NOW(),
    NOW()
FROM articles a
CROSS JOIN warehouses w
WHERE w.code IN ('WH-MDN-001', 'WH-SMG-001', 'WH-DPS-001')
ON CONFLICT DO NOTHING;
