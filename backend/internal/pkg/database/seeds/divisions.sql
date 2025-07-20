-- Development seed data for business divisions
-- Professional hierarchy structure suitable for most businesses
INSERT INTO divisions (code, name, description, parent_id, level, is_active) VALUES
-- Level 1 Divisions
('PENJUALAN', 'Divisi Penjualan', 'Bertanggung jawab atas semua aktivitas penjualan', NULL, 1, true),
('PRODUKSI', 'Divisi Produksi', 'Bertanggung jawab atas proses manufaktur dan kualitas produk', NULL, 1, true),
('KEUANGAN', 'Divisi Keuangan', 'Bertanggung jawab atas pengelolaan keuangan dan akuntansi', NULL, 1, true),
('HRD', 'Divisi Sumber Daya Manusia', 'Bertanggung jawab atas pengelolaan karyawan dan pengembangan organisasi', NULL, 1, true),
('LOGISTIK', 'Divisi Logistik', 'Bertanggung jawab atas rantai pasok, pergudangan, dan distribusi', NULL, 1, true),

-- Level 2 Divisions (assuming parent_id refers to the id of Level 1 divisions)
('PENJUALAN_RETAIL', 'Penjualan Ritel', 'Mengelola penjualan di toko fisik dan online', 'div001', 2, true),
('PENJUALAN_GROSIR', 'Penjualan Grosir', 'Mengelola penjualan ke distributor dan reseller', 'div001', 2, true),
('PRODUKSI_SEPATU', 'Produksi Sepatu', 'Mengawasi produksi sepatu dari bahan baku hingga produk jadi', 'div002', 2, true),
('QC_PRODUKSI', 'Kontrol Kualitas Produksi', 'Memastikan standar kualitas produk terpenuhi', 'div002', 2, true),
('AKUNTANSI', 'Akuntansi', 'Mencatat dan melaporkan transaksi keuangan', 'div003', 2, true),
('PAJAK', 'Pajak', 'Mengelola kepatuhan pajak perusahaan', 'div003', 2, true),
('REKRUTMEN', 'Rekrutmen & Seleksi', 'Melakukan proses rekrutmen karyawan baru', 'div004', 2, true),
('PELATIHAN', 'Pelatihan & Pengembangan', 'Mengembangkan program pelatihan untuk karyawan', 'div004', 2, true),
('GUDANG', 'Manajemen Gudang', 'Mengelola stok barang di gudang', 'div005', 2, true),
('DISTRIBUSI', 'Distribusi & Pengiriman', 'Mengatur pengiriman produk ke pelanggan', 'div005', 2, true);