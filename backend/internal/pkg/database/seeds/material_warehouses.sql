-- Material Warehouses seed data
INSERT INTO material_warehouses (warehouse_code, warehouse_name, warehouse_type, location, manager_id) VALUES
('MWH001', 'Gudang Bahan Baku Jakarta', 'MATERIAL', 'Jl. Industri No. 15, Jakarta Timur', (SELECT id FROM users WHERE email = 'manager@malaka.co.id' LIMIT 1)),
('MWH002', 'Gudang Komponen Tangerang', 'MATERIAL', 'Jl. Raya Serpong No. 88, Tangerang', (SELECT id FROM users WHERE email = 'supervisor@malaka.co.id' LIMIT 1)),
('MWH003', 'Gudang Finishing Bandung', 'MATERIAL', 'Jl. Cibaduyut No. 45, Bandung', (SELECT id FROM users WHERE email = 'staff@malaka.co.id' LIMIT 1)),
('MWH004', 'Gudang Aksesoris Surabaya', 'MATERIAL', 'Jl. Rungkut Industri No. 12, Surabaya', (SELECT id FROM users WHERE email = 'manager@malaka.co.id' LIMIT 1)),
('MWH005', 'Gudang Kemasan Semarang', 'MATERIAL', 'Jl. Kaligawe No. 67, Semarang', (SELECT id FROM users WHERE email = 'supervisor@malaka.co.id' LIMIT 1)),
('MWH006', 'Gudang Mix Material Yogya', 'MATERIAL', 'Jl. Wates Km 8, Yogyakarta', (SELECT id FROM users WHERE email = 'staff@malaka.co.id' LIMIT 1)),
('MWH007', 'Gudang Bahan Import Medan', 'MATERIAL', 'Jl. Gatot Subroto No. 22, Medan', (SELECT id FROM users WHERE email = 'manager@malaka.co.id' LIMIT 1)),
('MWH008', 'Gudang Regional Makassar', 'MATERIAL', 'Jl. Urip Sumoharjo No. 33, Makassar', (SELECT id FROM users WHERE email = 'supervisor@malaka.co.id' LIMIT 1)),
('MWH009', 'Gudang QC Material Jakarta', 'MATERIAL', 'Jl. Industri No. 17, Jakarta Timur', (SELECT id FROM users WHERE email = 'staff@malaka.co.id' LIMIT 1)),
('MWH010', 'Gudang Reject Material', 'MATERIAL', 'Jl. Margonda No. 55, Depok', (SELECT id FROM users WHERE email = 'supervisor@malaka.co.id' LIMIT 1));