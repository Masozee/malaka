-- Cash Disbursements - Indonesian Business Expense Transactions
-- Cash and bank disbursements for various business expenses

INSERT INTO cash_disbursements (disbursement_number, disbursement_date, cash_bank_id, paid_to, amount, currency, reference_number, reference_type, description, payment_method, approved_by) VALUES
-- Supplier payments
('CD-20250115-001', '2025-01-15', '550e8400-e29b-41d4-a716-446655440003', 'CV Kulit Berkualitas Garut', 15000000.00, 'IDR', 'PO-20250115-001', 'SUPPLIER_PAYMENT', 'Pembayaran pembelian bahan baku kulit sapi grade A', 'BANK_TRANSFER', 'purchasing_manager', '2025-01-15 10:30:00', '2025-01-15 10:30:00'),
('CD-20250116-001', '2025-01-16', '550e8400-e29b-41d4-a716-446655440004', 'PT Bahan Kimia Indonesia', 2500000.00, 'IDR', 'INV-BKI-20250116-002', 'SUPPLIER_PARTIAL', 'Pembayaran partial untuk bahan kimia tanning kulit', 'BANK_TRANSFER', 'purchasing_manager', '2025-01-16 14:20:00', '2025-01-16 14:20:00'),
('CD-20250117-001', '2025-01-17', '550e8400-e29b-41d4-a716-446655440005', 'CV Sol Sepatu Bandung', 8000000.00, 'IDR', 'PO-20250117-002', 'SUPPLIER_ADVANCE', 'Uang muka pembelian sol karet untuk produksi', 'BANK_TRANSFER', 'purchasing_manager', '2025-01-17 11:45:00', '2025-01-17 11:45:00'),
('CD-20250118-001', '2025-01-18', '550e8400-e29b-41d4-a716-446655440006', 'PT Benang Rajut Nusantara', 4000000.00, 'IDR', 'INV-BRN-20250118-004', 'SUPPLIER_PARTIAL', 'Pembayaran cicilan benang jahit dan tali sepatu', 'BANK_TRANSFER', 'purchasing_manager', '2025-01-18 09:30:00', '2025-01-18 09:30:00'),

-- Salary and employee payments
('CD-20250120-001', '2025-01-20', '550e8400-e29b-41d4-a716-446655440005', 'Budi Santoso', 8500000.00, 'IDR', 'SAL-202501-001', 'SALARY_PAYMENT', 'Pembayaran gaji bulan Januari 2025 - Manager Produksi', 'BANK_TRANSFER', 'hr_manager', '2025-01-20 09:00:00', '2025-01-20 09:00:00'),
('CD-20250120-002', '2025-01-20', '550e8400-e29b-41d4-a716-446655440005', 'Sari Dewi', 6500000.00, 'IDR', 'SAL-202501-002', 'SALARY_PAYMENT', 'Pembayaran gaji bulan Januari 2025 - Supervisor QC', 'BANK_TRANSFER', 'hr_manager', '2025-01-20 09:15:00', '2025-01-20 09:15:00'),
('CD-20250120-003', '2025-01-20', '550e8400-e29b-41d4-a716-446655440005', 'Ahmad Hidayat', 5500000.00, 'IDR', 'SAL-202501-003', 'SALARY_PAYMENT', 'Pembayaran gaji bulan Januari 2025 - Sales Executive', 'BANK_TRANSFER', 'hr_manager', '2025-01-20 09:30:00', '2025-01-20 09:30:00'),
('CD-20250120-004', '2025-01-20', '550e8400-e29b-41d4-a716-446655440005', 'Dewi Lestari', 7500000.00, 'IDR', 'SAL-202501-004', 'SALARY_PAYMENT', 'Pembayaran gaji bulan Januari 2025 - Finance Manager', 'BANK_TRANSFER', 'hr_manager', '2025-01-20 09:45:00', '2025-01-20 09:45:00'),

-- Utility payments
('CD-20250121-001', '2025-01-21', '550e8400-e29b-41d4-a716-446655440001', 'PT Listrik Negara (PLN)', 18500000.00, 'IDR', 'PLN-202501', 'UTILITY_PAYMENT', 'Pembayaran tagihan listrik pabrik dan kantor bulan Januari', 'CASH', 'admin_manager', '2025-01-21 08:00:00', '2025-01-21 08:00:00'),
('CD-20250122-001', '2025-01-22', '550e8400-e29b-41d4-a716-446655440001', 'PT Telekomunikasi Indonesia', 3200000.00, 'IDR', 'TELKOM-202501', 'UTILITY_PAYMENT', 'Pembayaran tagihan telepon dan internet kantor', 'CASH', 'admin_manager', '2025-01-22 09:30:00', '2025-01-22 09:30:00'),
('CD-20250123-001', '2025-01-23', '550e8400-e29b-41d4-a716-446655440001', 'PDAM Jakarta', 1850000.00, 'IDR', 'PDAM-202501', 'UTILITY_PAYMENT', 'Pembayaran tagihan air PDAM bulan Januari', 'CASH', 'admin_manager', '2025-01-23 10:15:00', '2025-01-23 10:15:00'),

-- Rent and facility costs
('CD-20250124-001', '2025-01-24', '550e8400-e29b-41d4-a716-446655440003', 'PT Properti Jakarta', 25000000.00, 'IDR', 'RENT-202501', 'RENT_PAYMENT', 'Pembayaran sewa kantor Jakarta bulan Januari 2025', 'BANK_TRANSFER', 'facility_manager', '2025-01-24 11:15:00', '2025-01-24 11:15:00'),
('CD-20250125-001', '2025-01-25', '550e8400-e29b-41d4-a716-446655440004', 'CV Jasa Kebersihan Prima', 4000000.00, 'IDR', 'CLEAN-202501', 'SERVICE_PARTIAL', 'Pembayaran partial jasa kebersihan kantor dan pabrik', 'BANK_TRANSFER', 'facility_manager', '2025-01-25 14:30:00', '2025-01-25 14:30:00'),

-- Transportation and logistics
('CD-20250126-001', '2025-01-26', '550e8400-e29b-41d4-a716-446655440005', 'SPBU Pertamina Cikini', 3200000.00, 'IDR', 'FUEL-202501', 'FUEL_PAYMENT', 'Pembayaran bahan bakar kendaraan operasional', 'BANK_TRANSFER', 'logistics_manager', '2025-01-26 08:30:00', '2025-01-26 08:30:00'),
('CD-20250127-001', '2025-01-27', '550e8400-e29b-41d4-a716-446655440006', 'PT Angkutan Barang Sejahtera', 5000000.00, 'IDR', 'TRANS-202501', 'TRANSPORT_PARTIAL', 'Pembayaran partial jasa angkutan bahan baku', 'BANK_TRANSFER', 'logistics_manager', '2025-01-27 12:30:00', '2025-01-27 12:30:00'),

-- Professional services
('CD-20250128-001', '2025-01-28', '550e8400-e29b-41d4-a716-446655440003', 'PT Konsultan Hukum Terpadu', 7500000.00, 'IDR', 'LEGAL-202501', 'LEGAL_ADVANCE', 'Uang muka jasa konsultasi hukum kontrak ekspor', 'BANK_TRANSFER', 'legal_manager', '2025-01-28 14:30:00', '2025-01-28 14:30:00'),
('CD-20250129-001', '2025-01-29', '550e8400-e29b-41d4-a716-446655440003', 'CV Audit dan Konsultan', 12500000.00, 'IDR', 'AUDIT-202501', 'AUDIT_ADVANCE', 'Uang muka jasa audit internal dan review sistem', 'BANK_TRANSFER', 'finance_manager', '2025-01-29 16:15:00', '2025-01-29 16:15:00'),

-- Tax payments
('CD-20250130-001', '2025-01-30', '550e8400-e29b-41d4-a716-446655440003', 'Kantor Pajak Jakarta Pusat', 8750000.00, 'IDR', 'TAX-202412', 'TAX_PAYMENT', 'Pembayaran pajak penghasilan bulan Desember 2024', 'BANK_TRANSFER', 'tax_manager', '2025-01-30 15:45:00', '2025-01-30 15:45:00'),
('CD-20250131-001', '2025-01-31', '550e8400-e29b-41d4-a716-446655440003', 'Kantor Pajak Jakarta Pusat', 4250000.00, 'IDR', 'PPN-202501', 'VAT_PAYMENT', 'Pembayaran PPN masa pajak Januari 2025', 'BANK_TRANSFER', 'tax_manager', '2025-01-31 16:30:00', '2025-01-31 16:30:00'),

-- Maintenance and repairs
('CD-20250201-001', '2025-02-01', '550e8400-e29b-41d4-a716-446655440011', 'CV Servis Elektronik', 1500000.00, 'IDR', 'MAINT-202501', 'MAINTENANCE_PAYMENT', 'Pembayaran service dan maintenance peralatan kantor', 'CASH', 'maintenance_staff', '2025-02-01 11:20:00', '2025-02-01 11:20:00'),

-- Petty cash expenses
('CD-20250202-001', '2025-02-02', '550e8400-e29b-41d4-a716-446655440011', 'Various Vendors', 750000.00, 'IDR', 'PETTY-202501', 'PETTY_CASH', 'Pengeluaran petty cash untuk keperluan operasional harian', 'CASH', 'admin_staff', '2025-02-02 16:00:00', '2025-02-02 16:00:00'),

-- Insurance payments
('CD-20250203-001', '2025-02-03', '550e8400-e29b-41d4-a716-446655440003', 'PT Asuransi Jiwa Bersama', 35000000.00, 'IDR', 'INS-Q1-2025', 'INSURANCE_PREMIUM', 'Pembayaran premi asuransi jiwa dan kesehatan Q1 2025', 'BANK_TRANSFER', 'hr_manager', '2025-02-03 09:30:00', '2025-02-03 09:30:00'),

-- Marketing and advertising
('CD-20250204-001', '2025-02-04', '550e8400-e29b-41d4-a716-446655440004', 'PT Media Promosi Digital', 9000000.00, 'IDR', 'MARKET-202501', 'MARKETING_ADVANCE', 'Uang muka kampanye marketing digital dan konten', 'BANK_TRANSFER', 'marketing_manager', '2025-02-04 13:15:00', '2025-02-04 13:15:00'),

-- Bank charges and fees
('CD-20250205-001', '2025-02-05', '550e8400-e29b-41d4-a716-446655440003', 'Bank Mandiri Jakarta Pusat', 450000.00, 'IDR', 'BANK-FEE-202501', 'BANK_CHARGES', 'Biaya administrasi dan layanan perbankan Januari', 'AUTO_DEBIT', 'bank_system', '2025-02-05 23:59:00', '2025-02-05 23:59:00'),
('CD-20250205-002', '2025-02-05', '550e8400-e29b-41d4-a716-446655440004', 'Bank Central Asia', 350000.00, 'IDR', 'BANK-FEE-202501-BCA', 'BANK_CHARGES', 'Biaya administrasi BCA dan biaya transfer', 'AUTO_DEBIT', 'bank_system', '2025-02-05 23:58:00', '2025-02-05 23:58:00');