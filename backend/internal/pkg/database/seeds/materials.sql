-- Materials seed data
INSERT INTO materials (material_code, material_name, category, unit_of_measure, standard_cost, current_cost, minimum_stock, maximum_stock, reorder_point, supplier_id, lead_time_days) VALUES
('MAT001', 'Kulit Sapi Grade A', 'Bahan Baku Utama', 'METER', 250000.00, 275000.00, 50, 500, 100, (SELECT id FROM suppliers WHERE name = 'UD Kulit Jaya' LIMIT 1), 14),
('MAT002', 'Sol Karet Berkualitas', 'Komponen', 'PASANG', 35000.00, 38000.00, 100, 1000, 200, (SELECT id FROM suppliers WHERE name = 'PT Sepatu Indonesia' LIMIT 1), 7),
('MAT003', 'Benang Jahit Nilon', 'Bahan Pendukung', 'GULUNG', 15000.00, 16500.00, 20, 200, 50, (SELECT id FROM suppliers WHERE name = 'CV Sandal Nusantara' LIMIT 1), 5),
('MAT004', 'Lem Sepatu Super', 'Kimia', 'LITER', 85000.00, 92000.00, 10, 100, 25, (SELECT id FROM suppliers WHERE name = 'UD Kulit Jaya' LIMIT 1), 10),
('MAT005', 'Resleting Logam YKK', 'Aksesoris', 'BUAH', 8500.00, 9200.00, 500, 5000, 1000, (SELECT id FROM suppliers WHERE name = 'PT Sepatu Indonesia' LIMIT 1), 21),
('MAT006', 'Kancing Sepatu Brass', 'Aksesoris', 'BUAH', 2500.00, 2750.00, 1000, 10000, 2000, (SELECT id FROM suppliers WHERE name = 'CV Sandal Nusantara' LIMIT 1), 7),
('MAT007', 'Tali Sepatu Katun', 'Aksesoris', 'PASANG', 12000.00, 13200.00, 200, 2000, 400, (SELECT id FROM suppliers WHERE name = 'UD Kulit Jaya' LIMIT 1), 14),
('MAT008', 'Busa Dalam Sepatu', 'Komponen', 'LEMBAR', 18000.00, 19800.00, 150, 1500, 300, (SELECT id FROM suppliers WHERE name = 'PT Sepatu Indonesia' LIMIT 1), 10),
('MAT009', 'Cat Kulit Hitam', 'Finishing', 'KALENG', 45000.00, 49500.00, 25, 250, 50, (SELECT id FROM suppliers WHERE name = 'CV Sandal Nusantara' LIMIT 1), 12),
('MAT010', 'Pewarna Kulit Coklat', 'Finishing', 'KALENG', 42000.00, 46200.00, 30, 300, 60, (SELECT id FROM suppliers WHERE name = 'UD Kulit Jaya' LIMIT 1), 12),
('MAT011', 'Kanvas Sepatu Premium', 'Bahan Baku', 'METER', 65000.00, 71500.00, 40, 400, 80, (SELECT id FROM suppliers WHERE name = 'PT Sepatu Indonesia' LIMIT 1), 18),
('MAT012', 'Metal Buckle Import', 'Aksesoris', 'BUAH', 15000.00, 16500.00, 100, 1000, 200, (SELECT id FROM suppliers WHERE name = 'CV Sandal Nusantara' LIMIT 1), 25),
('MAT013', 'Insole Memory Foam', 'Komponen', 'PASANG', 28000.00, 30800.00, 80, 800, 160, (SELECT id FROM suppliers WHERE name = 'UD Kulit Jaya' LIMIT 1), 15),
('MAT014', 'Velcro Strip 2cm', 'Aksesoris', 'METER', 22000.00, 24200.00, 50, 500, 100, (SELECT id FROM suppliers WHERE name = 'PT Sepatu Indonesia' LIMIT 1), 8),
('MAT015', 'Box Sepatu Karton', 'Kemasan', 'BUAH', 3500.00, 3850.00, 2000, 20000, 4000, (SELECT id FROM suppliers WHERE name = 'CV Sandal Nusantara' LIMIT 1), 3);