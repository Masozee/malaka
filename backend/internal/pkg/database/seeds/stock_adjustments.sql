-- Indonesian Stock Adjustments Seed Data
INSERT INTO stock_adjustments (article_id, warehouse_id, quantity, adjustment_date, reason) VALUES
('art001', 'wh001', -2, NOW(), 'Barang rusak ditemukan saat stock opname'),
('art002', 'wh002', -1, NOW(), 'Sepatu hilang dari gudang'),
('art003', 'wh003', 3, NOW(), 'Koreksi kesalahan pencatatan'),
('art004', 'wh004', -5, NOW(), 'Sepatu cacat produksi'),
('art005', 'wh005', 2, NOW(), 'Tambahan stock dari temuan fisik'),
('art006', 'wh001', -1, NOW(), 'Sepatu oxford rusak saat handling'),
('art007', 'wh002', 4, NOW(), 'Penyesuaian hasil audit internal'),
('art008', 'wh003', -3, NOW(), 'Sepatu lari tidak sesuai standar QC'),
('art009', 'wh004', 1, NOW(), 'Koreksi selisih inventory'),
('art010', 'wh005', -2, NOW(), 'Slip-on sobek saat pengecekan'),
('art011', 'wh006', -1, NOW(), 'Ankle boots cacat jahitan'),
('art012', 'wh007', 2, NOW(), 'Penyesuaian stock fisik'),
('art013', 'wh008', -3, NOW(), 'Moccasin rusak karena kelembaban'),
('art014', 'wh009', 1, NOW(), 'Koreksi data entry yang salah'),
('art015', 'wh010', -2, NOW(), 'Wedges patah saat penyimpanan');