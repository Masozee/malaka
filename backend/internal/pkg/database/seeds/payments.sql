-- Payments - Indonesian Business Payment Transactions
-- Payment records for various business transactions in Indonesian context

INSERT INTO payments (payment_number, payment_date, payment_type, payment_method, reference_id, reference_type, payer_name, payer_account, payee_name, payee_account, amount, currency, exchange_rate, description, status, created_by) VALUES
-- Supplier payments
('PAY20250101001', '2025-01-15', 'OUTGOING', 'BANK_TRANSFER', 'PO20250101001', 'PURCHASE_ORDER', 'PT Sepatu Nusantara', '1370013888899', 'CV Kulit Berkualitas', '2871234567890', 15000000.00, 'IDR', 1.0, 'Pembayaran pembelian bahan baku kulit untuk produksi sepatu', 'COMPLETED', 'admin', '2025-01-15 10:30:00', '2025-01-15 10:30:00'),
('PAY20250102001', '2025-01-16', 'OUTGOING', 'CASH', 'EXP20250102001', 'EXPENSE', 'PT Sepatu Nusantara', 'CASH001', 'PT Listrik Negara (PLN)', '', 2500000.00, 'IDR', 1.0, 'Pembayaran tagihan listrik kantor pusat bulan Januari 2025', 'COMPLETED', 'finance', '2025-01-16 14:20:00', '2025-01-16 14:20:00'),
('PAY20250103001', '2025-01-17', 'OUTGOING', 'BANK_TRANSFER', 'SAL20250103001', 'SALARY', 'PT Sepatu Nusantara', '0456789012', 'Budi Santoso', '1234567890123', 8500000.00, 'IDR', 1.0, 'Pembayaran gaji karyawan bulan Januari 2025 - Budi Santoso', 'COMPLETED', 'hr', '2025-01-17 09:00:00', '2025-01-17 09:00:00'),
('PAY20250104001', '2025-01-18', 'OUTGOING', 'BANK_TRANSFER', 'RENT20250104001', 'RENT', 'PT Sepatu Nusantara', '1370013888899', 'PT Properti Jakarta', '5567890123456', 12000000.00, 'IDR', 1.0, 'Pembayaran sewa kantor Jakarta bulan Januari 2025', 'COMPLETED', 'admin', '2025-01-18 11:15:00', '2025-01-18 11:15:00'),

-- Customer payments (incoming)
('PAY20250105001', '2025-01-19', 'INCOMING', 'BANK_TRANSFER', 'SO20250105001', 'SALES_ORDER', 'Toko Sepatu Bandung', '7001234567890', 'PT Sepatu Nusantara', '1370013888899', 25000000.00, 'IDR', 1.0, 'Pembayaran pesanan sepatu dari Toko Sepatu Bandung', 'COMPLETED', 'sales', '2025-01-19 13:45:00', '2025-01-19 13:45:00'),
('PAY20250106001', '2025-01-20', 'INCOMING', 'CASH', 'POS20250106001', 'POS_SALE', 'Ahmad Hidayat', '', 'PT Sepatu Nusantara', 'CASH002', 1200000.00, 'IDR', 1.0, 'Pembayaran tunai pembelian sepatu di toko Bandung', 'COMPLETED', 'cashier', '2025-01-20 16:30:00', '2025-01-20 16:30:00'),
('PAY20250107001', '2025-01-21', 'INCOMING', 'BANK_TRANSFER', 'INV20250107001', 'INVOICE', 'CV Dagang Jaya', '0034567890123', 'PT Sepatu Nusantara', '2871234567', 18500000.00, 'IDR', 1.0, 'Pembayaran invoice penjualan grosir sepatu', 'COMPLETED', 'finance', '2025-01-21 10:00:00', '2025-01-21 10:00:00'),

-- Operating expenses
('PAY20250108001', '2025-01-22', 'OUTGOING', 'CASH', 'TEL20250108001', 'TELECOM', 'PT Sepatu Nusantara', 'CASH001', 'PT Telekomunikasi Indonesia', '', 800000.00, 'IDR', 1.0, 'Pembayaran tagihan telepon dan internet kantor', 'COMPLETED', 'admin', '2025-01-22 14:00:00', '2025-01-22 14:00:00'),
('PAY20250109001', '2025-01-23', 'OUTGOING', 'BANK_TRANSFER', 'FUEL20250109001', 'FUEL', 'PT Sepatu Nusantara', '0456789012', 'SPBU Pertamina', '', 3200000.00, 'IDR', 1.0, 'Pembayaran bahan bakar kendaraan operasional', 'COMPLETED', 'logistics', '2025-01-23 08:30:00', '2025-01-23 08:30:00'),
('PAY20250110001', '2025-01-24', 'OUTGOING', 'CASH', 'MAINT20250110001', 'MAINTENANCE', 'PT Sepatu Nusantara', 'CASH005', 'CV Servis Elektronik', '', 1500000.00, 'IDR', 1.0, 'Pembayaran service dan maintenance peralatan kantor', 'COMPLETED', 'maintenance', '2025-01-24 11:20:00', '2025-01-24 11:20:00'),

-- Bank transfers between accounts
('PAY20250111001', '2025-01-25', 'INTERNAL', 'BANK_TRANSFER', 'TRF20250111001', 'INTERNAL_TRANSFER', 'PT Sepatu Nusantara', '1370013888899', 'PT Sepatu Nusantara', '2871234567', 10000000.00, 'IDR', 1.0, 'Transfer dana dari Mandiri ke BCA untuk kebutuhan operasional', 'COMPLETED', 'finance', '2025-01-25 09:15:00', '2025-01-25 09:15:00'),
('PAY20250112001', '2025-01-26', 'OUTGOING', 'BANK_TRANSFER', 'TAX20250112001', 'TAX', 'PT Sepatu Nusantara', '1370013888899', 'Kantor Pajak Jakarta Pusat', '', 8750000.00, 'IDR', 1.0, 'Pembayaran pajak penghasilan bulan Desember 2024', 'COMPLETED', 'tax', '2025-01-26 15:45:00', '2025-01-26 15:45:00'),

-- Customer advance payments
('PAY20250113001', '2025-01-27', 'INCOMING', 'BANK_TRANSFER', 'ADV20250113001', 'ADVANCE', 'PT Retail Nusantara', '0123456789012', 'PT Sepatu Nusantara', '1370013888899', 30000000.00, 'IDR', 1.0, 'Pembayaran uang muka pesanan sepatu untuk event khusus', 'COMPLETED', 'sales', '2025-01-27 12:30:00', '2025-01-27 12:30:00'),
('PAY20250114001', '2025-01-28', 'OUTGOING', 'CASH', 'PETTY20250114001', 'PETTY_CASH', 'PT Sepatu Nusantara', 'CASH005', 'Various Vendors', '', 750000.00, 'IDR', 1.0, 'Pengeluaran petty cash untuk keperluan operasional harian', 'COMPLETED', 'admin', '2025-01-28 16:00:00', '2025-01-28 16:00:00'),
('PAY20250115001', '2025-01-29', 'INCOMING', 'E_WALLET', 'EWALLET20250115001', 'ONLINE_SALE', 'Sari Dewi', 'GOPAY', 'PT Sepatu Nusantara', 'GOPAY_MERCHANT', 650000.00, 'IDR', 1.0, 'Pembayaran via GoPay untuk pembelian online sepatu sneakers', 'COMPLETED', 'online', '2025-01-29 20:15:00', '2025-01-29 20:15:00'),

-- Pending payments
('PAY20250116001', '2025-01-30', 'OUTGOING', 'BANK_TRANSFER', 'BONUS20250116001', 'BONUS', 'PT Sepatu Nusantara', '0456789012', 'All Employees', '', 25000000.00, 'IDR', 1.0, 'Pembayaran bonus kinerja karyawan Q4 2024', 'PENDING', 'hr', '2025-01-30 10:00:00', '2025-01-30 10:00:00'),
('PAY20250117001', '2025-01-31', 'INCOMING', 'BANK_TRANSFER', 'REF20250117001', 'REFUND', 'CV Sepatu Rusak', '7001234567890', 'PT Sepatu Nusantara', '1370013888899', 2400000.00, 'IDR', 1.0, 'Refund pembayaran untuk barang yang dikembalikan', 'PENDING', 'customer_service', '2025-01-31 14:30:00', '2025-01-31 14:30:00'),
('PAY20250118001', '2025-02-01', 'OUTGOING', 'BANK_TRANSFER', 'INSURANCE20250118001', 'INSURANCE', 'PT Sepatu Nusantara', '1370013888899', 'PT Asuransi Indonesia', '', 4200000.00, 'IDR', 1.0, 'Pembayaran premi asuransi kendaraan dan properti', 'PROCESSING', 'insurance', '2025-02-01 09:30:00', '2025-02-01 09:30:00'),
('PAY20250119001', '2025-02-02', 'INCOMING', 'BANK_TRANSFER', 'DIVIDEND20250119001', 'DIVIDEND', 'PT Investasi Sepatu', '0034567890123', 'PT Sepatu Nusantara', '1370013888899', 15000000.00, 'IDR', 1.0, 'Penerimaan dividen dari investasi saham', 'COMPLETED', 'investment', '2025-02-02 11:00:00', '2025-02-02 11:00:00'),
('PAY20250120001', '2025-02-03', 'OUTGOING', 'CASH', 'TRAINING20250120001', 'TRAINING', 'PT Sepatu Nusantara', 'CASH001', 'Lembaga Pelatihan Profesional', '', 5500000.00, 'IDR', 1.0, 'Pembayaran program pelatihan karyawan bulan Februari', 'COMPLETED', 'hr', '2025-02-03 13:15:00', '2025-02-03 13:15:00');