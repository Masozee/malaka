-- RFQ seed data for Malaka ERP
-- Indonesian shoe manufacturing company RFQ examples

-- First, let's get some user and supplier IDs
-- Assuming we have users and suppliers already in the database

-- Insert RFQs
INSERT INTO rfqs (id, rfq_number, title, description, status, priority, created_by, due_date, published_at) VALUES
('11111111-1111-1111-1111-111111111111', 'RFQ-2025-001', 'Kulit Sapi Premium untuk Sepatu Formal', 'Permintaan penawaran untuk kulit sapi grade A berkualitas tinggi untuk produksi sepatu formal. Membutuhkan kulit dengan ketebalan 1.2-1.4mm, warna natural.', 'published', 'high', (SELECT id FROM users LIMIT 1), NOW() + INTERVAL '14 days', NOW() - INTERVAL '2 days'),

('22222222-2222-2222-2222-222222222222', 'RFQ-2025-002', 'Bahan Sol Karet untuk Sepatu Olahraga', 'Membutuhkan bahan sol karet EVA berkualitas tinggi untuk produksi sepatu olahraga. Spesifikasi densitas 0.4-0.6 g/cm³.', 'published', 'medium', (SELECT id FROM users LIMIT 1), NOW() + INTERVAL '10 days', NOW() - INTERVAL '1 day'),

('33333333-3333-3333-3333-333333333333', 'RFQ-2025-003', 'Mesin Cutting Otomatis', 'Penawaran untuk mesin cutting otomatis untuk pemotongan kulit. Kapasitas minimum 200 pasang sepatu per hari.', 'draft', 'medium', (SELECT id FROM users LIMIT 1), NOW() + INTERVAL '21 days', NULL),

('44444444-4444-4444-4444-444444444444', 'RFQ-2025-004', 'Packaging Box Custom untuk Export', 'Membutuhkan kotak kemasan custom untuk ekspor sepatu. Bahan kardus corrugated, ukuran 35x25x15cm.', 'published', 'low', (SELECT id FROM users LIMIT 1), NOW() + INTERVAL '7 days', NOW() - INTERVAL '3 days'),

('55555555-5555-5555-5555-555555555555', 'RFQ-2025-005', 'Tali Sepatu Berkualitas Export', 'Permintaan penawaran tali sepatu berbagai warna dan ukuran untuk keperluan ekspor. Material polyester dan cotton blend.', 'closed', 'medium', (SELECT id FROM users LIMIT 1), NOW() - INTERVAL '5 days', NOW() - INTERVAL '15 days');

-- Insert RFQ Items
INSERT INTO rfq_items (id, rfq_id, item_name, description, specification, quantity, unit, target_price) VALUES
-- RFQ-2025-001 items
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Kulit Sapi Grade A', 'Kulit sapi premium untuk upper sepatu formal', 'Ketebalan 1.2-1.4mm, warna natural, tanpa cacat', 500, 'lembar', 85000.00),
('a1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Kulit Sapi Grade A Hitam', 'Kulit sapi hitam untuk sepatu formal', 'Ketebalan 1.2-1.4mm, warna hitam pekat', 300, 'lembar', 90000.00),

-- RFQ-2025-002 items  
('a2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Sol Karet EVA Putih', 'Sol karet EVA warna putih untuk sepatu olahraga', 'Densitas 0.4-0.6 g/cm³, ukuran 39-44', 1000, 'pasang', 25000.00),
('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Sol Karet EVA Hitam', 'Sol karet EVA warna hitam untuk sepatu olahraga', 'Densitas 0.4-0.6 g/cm³, ukuran 39-44', 800, 'pasang', 25000.00),

-- RFQ-2025-003 items
('a3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Mesin Cutting CNC', 'Mesin cutting otomatis dengan sistem CNC', 'Kapasitas 200+ pasang/hari, presisi ±0.1mm', 1, 'unit', 450000000.00),

-- RFQ-2025-004 items
('a4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'Box Sepatu Export 35x25x15', 'Kotak kemasan sepatu untuk ekspor', 'Kardus corrugated 3-ply, print 4-color', 10000, 'pcs', 3500.00),
('a4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'Insert Kardus', 'Insert kardus untuk pemisah sepatu', 'Kardus 2-ply, warna putih', 10000, 'pcs', 1200.00),

-- RFQ-2025-005 items
('a5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'Tali Sepatu Polyester 120cm', 'Tali sepatu polyester berbagai warna', 'Panjang 120cm, diameter 4mm, 10 warna', 50000, 'pasang', 2500.00),
('a5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 'Tali Sepatu Cotton 140cm', 'Tali sepatu cotton blend warna natural', 'Panjang 140cm, diameter 5mm', 30000, 'pasang', 3000.00);

-- Insert RFQ Suppliers (invite suppliers to RFQs)
INSERT INTO rfq_suppliers (rfq_id, supplier_id, status, invited_at, responded_at) VALUES
-- RFQ-2025-001 suppliers
('11111111-1111-1111-1111-111111111111', (SELECT id FROM suppliers WHERE name LIKE '%Kulit%' LIMIT 1), 'responded', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM suppliers WHERE name LIKE '%Prima%' LIMIT 1), 'invited', NOW() - INTERVAL '2 days', NULL),

-- RFQ-2025-002 suppliers
('22222222-2222-2222-2222-222222222222', (SELECT id FROM suppliers WHERE name LIKE '%Sepatu%' LIMIT 1), 'responded', NOW() - INTERVAL '1 day', NOW()),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM suppliers WHERE name LIKE '%Prima%' LIMIT 1), 'invited', NOW() - INTERVAL '1 day', NULL),

-- RFQ-2025-004 suppliers  
('44444444-4444-4444-4444-444444444444', (SELECT id FROM suppliers WHERE name LIKE '%Sepatu%' LIMIT 1), 'responded', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),

-- RFQ-2025-005 suppliers (closed)
('55555555-5555-5555-5555-555555555555', (SELECT id FROM suppliers WHERE name LIKE '%Kulit%' LIMIT 1), 'responded', NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days');