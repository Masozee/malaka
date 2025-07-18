-- Indonesian Simple Goods Issues Seed Data
INSERT INTO simple_goods_issues (id, warehouse_id, issue_date, status, notes, created_at, updated_at) VALUES
('gi001', 'wh001', '2024-01-10', 'completed', 'Pengiriman sepatu ke toko retail Jakarta Pusat', NOW(), NOW()),
('gi002', 'wh002', '2024-01-12', 'completed', 'Distribusi ke outlet Surabaya', NOW(), NOW()),
('gi003', 'wh003', '2024-01-15', 'completed', 'Kirim barang ke agen Bandung', NOW(), NOW()),
('gi004', 'wh004', '2024-01-18', 'completed', 'Transfer stock ke cabang Medan', NOW(), NOW()),
('gi005', 'wh005', '2024-01-20', 'completed', 'Pengiriman urgency order ke customer premium', NOW(), NOW()),
('gi006', 'wh006', '2024-01-22', 'pending', 'Persiapan kirim ke mall Bekasi', NOW(), NOW()),
('gi007', 'wh007', '2024-01-25', 'pending', 'Barang return setelah QC', NOW(), NOW()),
('gi008', 'wh008', '2024-01-28', 'pending', 'Distribusi koleksi baru musim semi', NOW(), NOW()),
('gi009', 'wh009', '2024-02-02', 'draft', 'Rencana kirim ke distributor regional', NOW(), NOW()),
('gi010', 'wh010', '2024-02-05', 'draft', 'Persiapan stock untuk event pameran', NOW(), NOW()),
('gi011', 'wh011', '2024-02-08', 'canceled', 'Dibatalkan karena perubahan order', NOW(), NOW()),
('gi012', 'wh012', '2024-02-10', 'canceled', 'Customer membatalkan pesanan mendadak', NOW(), NOW()),
('gi013', 'wh013', '2024-02-12', 'completed', 'Pengiriman sample ke calon klien besar', NOW(), NOW()),
('gi014', 'wh014', '2024-02-15', 'completed', 'Distribusi untuk pre-order online', NOW(), NOW()),
('gi015', 'wh015', '2024-02-18', 'pending', 'Menunggu konfirmasi alamat pengiriman', NOW(), NOW());