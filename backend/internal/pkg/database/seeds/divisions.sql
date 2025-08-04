-- Indonesian Business Divisions Seed Data
-- Hierarchical structure for shoe manufacturing and retail business

INSERT INTO divisions (code, name, description, parent_id, level, sort_order, status) VALUES

-- Level 1: Main Business Divisions
('PROD', 'Produksi', 'Divisi produksi sepatu dan manufaktur', NULL, 1, 1, 'active'),
('SALES', 'Penjualan', 'Divisi penjualan dan pemasaran', NULL, 1, 2, 'active'),
('FIN', 'Keuangan', 'Divisi keuangan dan akuntansi', NULL, 1, 3, 'active'),
('HR', 'Sumber Daya Manusia', 'Divisi SDM dan personalia', NULL, 1, 4, 'active'),
('IT', 'Teknologi Informasi', 'Divisi IT dan sistem informasi', NULL, 1, 5, 'active'),
('LOG', 'Logistik', 'Divisi logistik dan distribusi', NULL, 1, 6, 'active'),
('QC', 'Quality Control', 'Divisi kontrol kualitas', NULL, 1, 7, 'active'),
('RND', 'Research & Development', 'Divisi riset dan pengembangan produk', NULL, 1, 8, 'active');

-- Level 2: Production Sub-Divisions
INSERT INTO divisions (code, name, description, parent_id, level, sort_order, status) VALUES
('PROD-CUT', 'Cutting & Pemotongan', 'Bagian pemotongan bahan baku', (SELECT id FROM divisions WHERE code = 'PROD'), 2, 1, 'active'),
('PROD-SEW', 'Penjahitan & Assembling', 'Bagian penjahitan dan perakitan sepatu', (SELECT id FROM divisions WHERE code = 'PROD'), 2, 2, 'active'),
('PROD-FIN', 'Finishing', 'Bagian finishing dan pengecatan', (SELECT id FROM divisions WHERE code = 'PROD'), 2, 3, 'active'),
('PROD-PACK', 'Packaging', 'Bagian pengemasan produk', (SELECT id FROM divisions WHERE code = 'PROD'), 2, 4, 'active');

-- Level 2: Sales Sub-Divisions  
INSERT INTO divisions (code, name, description, parent_id, level, sort_order, status) VALUES
('SALES-RETAIL', 'Retail Store', 'Penjualan toko retail', (SELECT id FROM divisions WHERE code = 'SALES'), 2, 1, 'active'),
('SALES-ONLINE', 'Online Marketing', 'Penjualan online dan e-commerce', (SELECT id FROM divisions WHERE code = 'SALES'), 2, 2, 'active'),
('SALES-WHOLE', 'Wholesale', 'Penjualan grosir dan distributor', (SELECT id FROM divisions WHERE code = 'SALES'), 2, 3, 'active'),
('SALES-EXPORT', 'Export Division', 'Penjualan ekspor internasional', (SELECT id FROM divisions WHERE code = 'SALES'), 2, 4, 'active');

-- Level 2: Finance Sub-Divisions
INSERT INTO divisions (code, name, description, parent_id, level, sort_order, status) VALUES
('FIN-ACC', 'Accounting', 'Bagian akuntansi dan pembukuan', (SELECT id FROM divisions WHERE code = 'FIN'), 2, 1, 'active'),
('FIN-CASH', 'Cashier & Treasury', 'Bagian kasir dan treasury', (SELECT id FROM divisions WHERE code = 'FIN'), 2, 2, 'active'),
('FIN-TAX', 'Tax & Compliance', 'Bagian pajak dan kepatuhan', (SELECT id FROM divisions WHERE code = 'FIN'), 2, 3, 'active'),
('FIN-BUDGET', 'Budget Planning', 'Bagian perencanaan anggaran', (SELECT id FROM divisions WHERE code = 'FIN'), 2, 4, 'active');

-- Level 2: HR Sub-Divisions
INSERT INTO divisions (code, name, description, parent_id, level, sort_order, status) VALUES
('HR-RECRUIT', 'Recruitment', 'Bagian rekrutmen dan seleksi', (SELECT id FROM divisions WHERE code = 'HR'), 2, 1, 'active'),
('HR-PAYROLL', 'Payroll & Benefits', 'Bagian penggajian dan tunjangan', (SELECT id FROM divisions WHERE code = 'HR'), 2, 2, 'active'),
('HR-TRAIN', 'Training & Development', 'Bagian pelatihan dan pengembangan', (SELECT id FROM divisions WHERE code = 'HR'), 2, 3, 'active'),
('HR-ADMIN', 'HR Administration', 'Bagian administrasi SDM', (SELECT id FROM divisions WHERE code = 'HR'), 2, 4, 'active');

-- Level 2: IT Sub-Divisions
INSERT INTO divisions (code, name, description, parent_id, level, sort_order, status) VALUES
('IT-DEV', 'Software Development', 'Bagian pengembangan software', (SELECT id FROM divisions WHERE code = 'IT'), 2, 1, 'active'),
('IT-INFRA', 'Infrastructure', 'Bagian infrastruktur IT', (SELECT id FROM divisions WHERE code = 'IT'), 2, 2, 'active'),
('IT-SUPPORT', 'User Support', 'Bagian dukungan pengguna', (SELECT id FROM divisions WHERE code = 'IT'), 2, 3, 'active'),
('IT-SECURITY', 'IT Security', 'Bagian keamanan sistem', (SELECT id FROM divisions WHERE code = 'IT'), 2, 4, 'active');

-- Level 2: Logistics Sub-Divisions
INSERT INTO divisions (code, name, description, parent_id, level, sort_order, status) VALUES
('LOG-WARE', 'Warehouse', 'Bagian gudang dan penyimpanan', (SELECT id FROM divisions WHERE code = 'LOG'), 2, 1, 'active'),
('LOG-SHIP', 'Shipping', 'Bagian pengiriman barang', (SELECT id FROM divisions WHERE code = 'LOG'), 2, 2, 'active'),
('LOG-INV', 'Inventory Control', 'Bagian kontrol persediaan', (SELECT id FROM divisions WHERE code = 'LOG'), 2, 3, 'active'),
('LOG-PROC', 'Procurement', 'Bagian pengadaan bahan baku', (SELECT id FROM divisions WHERE code = 'LOG'), 2, 4, 'active');

-- Level 3: Detailed Sub-Divisions (Examples)
INSERT INTO divisions (code, name, description, parent_id, level, sort_order, status) VALUES
-- Retail Store Details
('SALES-RT-JKT', 'Retail Jakarta', 'Toko retail wilayah Jakarta', (SELECT id FROM divisions WHERE code = 'SALES-RETAIL'), 3, 1, 'active'),
('SALES-RT-SBY', 'Retail Surabaya', 'Toko retail wilayah Surabaya', (SELECT id FROM divisions WHERE code = 'SALES-RETAIL'), 3, 2, 'active'),
('SALES-RT-BDG', 'Retail Bandung', 'Toko retail wilayah Bandung', (SELECT id FROM divisions WHERE code = 'SALES-RETAIL'), 3, 3, 'active'),
('SALES-RT-MDN', 'Retail Medan', 'Toko retail wilayah Medan', (SELECT id FROM divisions WHERE code = 'SALES-RETAIL'), 3, 4, 'active'),

-- Production Details
('PROD-CUT-LEATH', 'Leather Cutting', 'Pemotongan bahan kulit', (SELECT id FROM divisions WHERE code = 'PROD-CUT'), 3, 1, 'active'),
('PROD-CUT-FAB', 'Fabric Cutting', 'Pemotongan bahan kain', (SELECT id FROM divisions WHERE code = 'PROD-CUT'), 3, 2, 'active'),
('PROD-SEW-UPPER', 'Upper Sewing', 'Penjahitan bagian atas sepatu', (SELECT id FROM divisions WHERE code = 'PROD-SEW'), 3, 1, 'active'),
('PROD-SEW-SOLE', 'Sole Attachment', 'Pemasangan sol sepatu', (SELECT id FROM divisions WHERE code = 'PROD-SEW'), 3, 2, 'active');