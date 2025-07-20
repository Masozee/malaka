-- Accounts Payable - Indonesian Supplier Obligations
-- Outstanding payables to suppliers and vendors

INSERT INTO accounts_payable (vendor_name, vendor_code, invoice_number, invoice_date, due_date, original_amount, outstanding_amount, paid_amount, currency, description, status, payment_terms, contact_person, phone, email, created_by) VALUES
-- Material suppliers
('CV Kulit Berkualitas Garut', 'SUPL001', 'INV-KBG-20250115-001', '2025-01-15', '2025-02-14', 25000000.00, 25000000.00, 0.00, 'IDR', 'Pembelian kulit sapi grade A untuk produksi sepatu formal', 'OUTSTANDING', 'Net 30', 'Pak Budi Raharjo', '0262-123-4567', 'budi@kulitberkualitas.co.id', 'purchasing', '2025-01-15 10:30:00', '2025-01-15 10:30:00'),
('PT Bahan Kimia Indonesia', 'SUPL002', 'INV-BKI-20250116-002', '2025-01-16', '2025-02-15', 8500000.00, 6000000.00, 2500000.00, 'IDR', 'Pembelian bahan kimia untuk proses tanning kulit', 'PARTIAL', 'Net 30', 'Ibu Sari Widodo', '021-567-8901', 'sari@bahankimia.co.id', 'purchasing', '2025-01-16 14:20:00', '2025-01-20 09:15:00'),
('CV Sol Sepatu Bandung', 'SUPL003', 'INV-SSB-20250117-003', '2025-01-17', '2025-02-16', 15000000.00, 15000000.00, 0.00, 'IDR', 'Pembelian sol karet dan rubber untuk berbagai jenis sepatu', 'OUTSTANDING', 'Net 30', 'Pak Ahmad Sutrisno', '022-234-5678', 'ahmad@solsepatu.co.id', 'purchasing', '2025-01-17 11:45:00', '2025-01-17 11:45:00'),
('PT Benang Rajut Nusantara', 'SUPL004', 'INV-BRN-20250118-004', '2025-01-18', '2025-02-17', 12000000.00, 8000000.00, 4000000.00, 'IDR', 'Pembelian benang jahit dan tali sepatu berbagai warna', 'PARTIAL', 'Net 30', 'Ibu Dewi Lestari', '031-345-6789', 'dewi@benangrajut.co.id', 'purchasing', '2025-01-18 09:30:00', '2025-01-25 16:20:00'),

-- Equipment and machinery
('PT Mesin Sepatu Modern', 'SUPL005', 'INV-MSM-20250119-005', '2025-01-19', '2025-03-20', 85000000.00, 85000000.00, 0.00, 'IDR', 'Pembelian mesin stitching otomatis untuk produksi sepatu', 'OUTSTANDING', 'Net 60', 'Pak Joko Susanto', '024-456-7890', 'joko@mesinsepatu.co.id', 'engineering', '2025-01-19 13:15:00', '2025-01-19 13:15:00'),
('CV Alat Produksi Presisi', 'SUPL006', 'INV-APP-20250120-006', '2025-01-20', '2025-02-19', 35000000.00, 20000000.00, 15000000.00, 'IDR', 'Pembelian dies dan molding untuk bentuk sepatu baru', 'PARTIAL', 'Net 30', 'Pak Rudi Hartono', '0341-567-8901', 'rudi@alatproduksi.co.id', 'engineering', '2025-01-20 15:40:00', '2025-01-28 10:30:00'),

-- Utilities and services
('PT Listrik Negara (PLN)', 'UTIL001', 'INV-PLN-20250121-007', '2025-01-21', '2025-02-20', 18500000.00, 18500000.00, 0.00, 'IDR', 'Tagihan listrik pabrik dan kantor bulan Januari 2025', 'OUTSTANDING', 'Net 30', 'Customer Service PLN', '123', 'cs@pln.co.id', 'admin', '2025-01-21 08:00:00', '2025-01-21 08:00:00'),
('PT Telekomunikasi Indonesia', 'UTIL002', 'INV-TELKOM-20250122-008', '2025-01-22', '2025-02-21', 3200000.00, 3200000.00, 0.00, 'IDR', 'Tagihan telepon dan internet kantor bulan Januari', 'OUTSTANDING', 'Net 30', 'Customer Care Telkom', '147', 'care@telkom.co.id', 'admin', '2025-01-22 09:30:00', '2025-01-22 09:30:00'),
('CV Jasa Kebersihan Prima', 'SERV001', 'INV-JKP-20250123-009', '2025-01-23', '2025-02-22', 8000000.00, 4000000.00, 4000000.00, 'IDR', 'Jasa kebersihan kantor dan pabrik bulan Januari', 'PARTIAL', 'Net 30', 'Ibu Rina Sari', '021-678-9012', 'rina@kebersihanprima.co.id', 'facility', '2025-01-23 11:20:00', '2025-02-01 14:45:00'),

-- Professional services
('PT Konsultan Hukum Terpadu', 'PROF001', 'INV-KHT-20250124-010', '2025-01-24', '2025-02-23', 15000000.00, 15000000.00, 0.00, 'IDR', 'Jasa konsultasi hukum untuk kontrak ekspor', 'OUTSTANDING', 'Net 30', 'Dr. Slamet Riyadi, SH', '021-789-0123', 'slamet@konsultanhukum.co.id', 'legal', '2025-01-24 14:30:00', '2025-01-24 14:30:00'),
('CV Audit dan Konsultan', 'PROF002', 'INV-AK-20250125-011', '2025-01-25', '2025-02-24', 25000000.00, 25000000.00, 0.00, 'IDR', 'Jasa audit internal dan review sistem keuangan', 'OUTSTANDING', 'Net 30', 'Pak Bambang CPA', '021-890-1234', 'bambang@auditconsult.co.id', 'finance', '2025-01-25 16:15:00', '2025-01-25 16:15:00'),

-- Transportation and logistics
('PT Angkutan Barang Sejahtera', 'TRANS001', 'INV-ABS-20250126-012', '2025-01-26', '2025-02-25', 12500000.00, 7500000.00, 5000000.00, 'IDR', 'Jasa angkutan bahan baku dari supplier ke pabrik', 'PARTIAL', 'Net 30', 'Pak Edi Kurniawan', '021-901-2345', 'edi@angkutanbarang.co.id', 'logistics', '2025-01-26 10:45:00', '2025-02-02 13:20:00'),
('CV Ekspedisi Cepat Nusantara', 'TRANS002', 'INV-ECN-20250127-013', '2025-01-27', '2025-02-26', 9800000.00, 9800000.00, 0.00, 'IDR', 'Ongkos kirim produk ke customer regional Jawa', 'OUTSTANDING', 'Net 30', 'Ibu Maya Putri', '022-012-3456', 'maya@ekspedisicepat.co.id', 'logistics', '2025-01-27 12:30:00', '2025-01-27 12:30:00'),

-- Marketing and advertising
('PT Media Promosi Digital', 'MARK001', 'INV-MPD-20250128-014', '2025-01-28', '2025-02-27', 18000000.00, 18000000.00, 0.00, 'IDR', 'Jasa pembuatan konten digital dan social media marketing', 'OUTSTANDING', 'Net 30', 'Pak Ryan Creative', '021-123-4567', 'ryan@mediadigital.co.id', 'marketing', '2025-01-28 15:00:00', '2025-01-28 15:00:00'),
('CV Percetakan Kemasan Modern', 'MARK002', 'INV-PKM-20250129-015', '2025-01-29', '2025-02-28', 22000000.00, 11000000.00, 11000000.00, 'IDR', 'Percetakan kemasan sepatu dan brosur promosi', 'PARTIAL', 'Net 30', 'Ibu Lisa Handayani', '021-234-5678', 'lisa@percetakankemasan.co.id', 'marketing', '2025-01-29 09:15:00', '2025-02-05 11:30:00'),

-- Insurance and financial services
('PT Asuransi Jiwa Bersama', 'INS001', 'INV-AJB-20250130-016', '2025-01-30', '2025-02-29', 35000000.00, 35000000.00, 0.00, 'IDR', 'Premi asuransi jiwa dan kesehatan karyawan Q1 2025', 'OUTSTANDING', 'Net 30', 'Pak Agus Prasetyo', '021-345-6789', 'agus@asuransijiwa.co.id', 'hr', '2025-01-30 11:45:00', '2025-01-30 11:45:00'),
('PT Bank Mandiri (Persero)', 'BANK001', 'INV-MANDIRI-20250131-017', '2025-01-31', '2025-02-28', 2500000.00, 2500000.00, 0.00, 'IDR', 'Biaya administrasi dan layanan perbankan bulan Januari', 'OUTSTANDING', 'Net 28', 'Relationship Manager', '021-14000', 'rm@bankmandiri.co.id', 'finance', '2025-01-31 14:20:00', '2025-01-31 14:20:00'),

-- Overdue accounts
('CV Supplier Terlambat', 'SUPL007', 'INV-ST-20241215-018', '2024-12-15', '2025-01-14', 28000000.00, 28000000.00, 0.00, 'IDR', 'Pembelian bahan baku yang terlambat dibayar', 'OVERDUE', 'Net 30', 'Pak Hendra Late', '022-345-6789', 'hendra@supplierlate.co.id', 'purchasing', '2024-12-15 10:00:00', '2024-12-15 10:00:00'),
('PT Layanan Bermasalah', 'SERV002', 'INV-LB-20241220-019', '2024-12-20', '2025-01-19', 15500000.00, 15500000.00, 0.00, 'IDR', 'Jasa yang sudah jatuh tempo dan belum dibayar', 'OVERDUE', 'Net 30', 'Ibu Retno Problem', '031-456-7890', 'retno@layananbermasalah.co.id', 'admin', '2024-12-20 16:30:00', '2024-12-20 16:30:00'),
('CV Maintenance Darurat', 'MAINT001', 'INV-MD-20250201-020', '2025-02-01', '2025-03-03', 7500000.00, 7500000.00, 0.00, 'IDR', 'Perbaikan mesin produksi yang mendadak rusak', 'OUTSTANDING', 'Net 30', 'Pak Tony Teknisi', '024-567-8901', 'tony@maintenancedarurat.co.id', 'maintenance', '2025-02-01 08:30:00', '2025-02-01 08:30:00');