-- Indonesian Return Suppliers Seed Data
INSERT INTO return_suppliers (id, supplier_id, return_date, reason, created_at, updated_at) VALUES
('ret001', 'supp001', '2024-01-15', 'Barang rusak saat pengiriman', NOW(), NOW()),
('ret002', 'supp002', '2024-01-18', 'Kualitas tidak sesuai spesifikasi', NOW(), NOW()),
('ret003', 'supp003', '2024-01-22', 'Salah kirim ukuran', NOW(), NOW()),
('ret004', 'supp004', '2024-01-25', 'Barang expired/kadaluarsa', NOW(), NOW()),
('ret005', 'supp005', '2024-01-28', 'Kemasan rusak parah', NOW(), NOW()),
('ret006', 'supp006', '2024-02-05', 'Warna tidak sesuai pesanan', NOW(), NOW()),
('ret007', 'supp007', '2024-02-08', 'Barang cacat produksi', NOW(), NOW()),
('ret008', 'supp008', '2024-02-12', 'Jumlah tidak sesuai invoice', NOW(), NOW()),
('ret009', 'supp009', '2024-02-15', 'Model lama/tidak laku', NOW(), NOW()),
('ret010', 'supp010', '2024-02-18', 'Barang basah karena hujan', NOW(), NOW()),
('ret011', 'supp011', '2024-02-22', 'Kesalahan admin warehouse', NOW(), NOW()),
('ret012', 'supp012', '2024-02-25', 'Return by customer request', NOW(), NOW()),
('ret013', 'supp013', '2024-02-28', 'Barang tidak laku/overstock', NOW(), NOW()),
('ret014', 'supp014', '2024-03-05', 'Kualitas turun drastis', NOW(), NOW()),
('ret015', 'supp015', '2024-03-08', 'Salah kirim brand/merk', NOW(), NOW());