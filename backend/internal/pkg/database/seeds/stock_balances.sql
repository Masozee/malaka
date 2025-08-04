-- Stock Balance Seed Data
-- This creates stock balance entries linking articles to warehouses with quantities

INSERT INTO stock_balances (article_id, warehouse_id, quantity, created_at, updated_at) VALUES 
-- Articles from Main Warehouse Jakarta (Gudang Pusat Jakarta)
((SELECT id FROM articles WHERE barcode = 'NKE000001' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-JKT-001' LIMIT 1), 150, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'NKE000002' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-JKT-001' LIMIT 1), 89, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'NKE000005' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-JKT-001' LIMIT 1), 234, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'NKE000006' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-JKT-001' LIMIT 1), 67, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'CAS001001' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-JKT-001' LIMIT 1), 312, NOW(), NOW()),

-- Articles from Bandung Distribution Center
((SELECT id FROM articles WHERE barcode = 'NKE000001' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-BDG-001' LIMIT 1), 78, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'NKE000002' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-BDG-001' LIMIT 1), 145, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'CAS001002' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-BDG-001' LIMIT 1), 89, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'BFM002002' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-BDG-001' LIMIT 1), 178, NOW(), NOW()),

-- Articles from Surabaya Hub
((SELECT id FROM articles WHERE barcode = 'NKE000001' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-SBY-001' LIMIT 1), 98, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'NKE000005' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-SBY-001' LIMIT 1), 156, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'BFM002003' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-SBY-001' LIMIT 1), 123, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'CAS001003' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-SBY-001' LIMIT 1), 67, NOW(), NOW()),

-- Articles from Medan Regional Warehouse
((SELECT id FROM articles WHERE barcode = 'NKE000002' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-MDN-001' LIMIT 1), 234, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'NKE000006' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-MDN-001' LIMIT 1), 89, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'CAS001004' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-MDN-001' LIMIT 1), 156, NOW(), NOW()),

-- Articles from Semarang Transit
((SELECT id FROM articles WHERE barcode = 'CAS001001' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-SMG-001' LIMIT 1), 78, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'CAS001002' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-SMG-001' LIMIT 1), 134, NOW(), NOW()),
((SELECT id FROM articles WHERE barcode = 'BFM002002' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-SMG-001' LIMIT 1), 67, NOW(), NOW()),

-- Low stock and out of stock scenarios from Denpasar Warehouse
((SELECT id FROM articles WHERE barcode = 'BFM002003' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-DPS-001' LIMIT 1), 5, NOW(), NOW()), -- Low stock
((SELECT id FROM articles WHERE barcode = 'CAS001003' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-DPS-001' LIMIT 1), 0, NOW(), NOW()), -- Out of stock
((SELECT id FROM articles WHERE barcode = 'CAS001004' LIMIT 1), (SELECT id FROM warehouses WHERE code = 'WH-DPS-001' LIMIT 1), 2, NOW(), NOW()); -- Low stock