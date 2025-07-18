-- Indonesian Stock Adjustments Seed Data
INSERT INTO stock_adjustments (id, article_id, warehouse_id, quantity, adjustment_date, reason, created_at, updated_at) VALUES
('adj001', 'art001', 'wh001', -2, NOW(), 'Barang rusak ditemukan saat stock opname', NOW(), NOW()),
('adj002', 'art002', 'wh002', -1, NOW(), 'Sepatu hilang dari gudang', NOW(), NOW()),
('adj003', 'art003', 'wh003', 3, NOW(), 'Koreksi kesalahan pencatatan', NOW(), NOW()),
('adj004', 'art004', 'wh004', -5, NOW(), 'Sepatu cacat produksi', NOW(), NOW()),
('adj005', 'art005', 'wh005', 2, NOW(), 'Tambahan stock dari temuan fisik', NOW(), NOW()),
('adj006', 'art006', 'wh001', -1, NOW(), 'Sepatu oxford rusak saat handling', NOW(), NOW()),
('adj007', 'art007', 'wh002', 4, NOW(), 'Penyesuaian hasil audit internal', NOW(), NOW()),
('adj008', 'art008', 'wh003', -3, NOW(), 'Sepatu lari tidak sesuai standar QC', NOW(), NOW()),
('adj009', 'art009', 'wh004', 1, NOW(), 'Koreksi selisih inventory', NOW(), NOW()),
('adj010', 'art010', 'wh005', -2, NOW(), 'Slip-on sobek saat pengecekan', NOW(), NOW()),
('adj011', 'art011', 'wh006', -1, NOW(), 'Ankle boots cacat jahitan', NOW(), NOW()),
('adj012', 'art012', 'wh007', 2, NOW(), 'Penyesuaian stock fisik', NOW(), NOW()),
('adj013', 'art013', 'wh008', -3, NOW(), 'Moccasin rusak karena kelembaban', NOW(), NOW()),
('adj014', 'art014', 'wh009', 1, NOW(), 'Koreksi data entry yang salah', NOW(), NOW()),
('adj015', 'art015', 'wh010', -2, NOW(), 'Wedges patah saat penyimpanan', NOW(), NOW());