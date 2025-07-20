-- Bank Transfers - Indonesian Inter-Bank and Internal Transfers
-- Transfer transactions between different bank accounts

INSERT INTO bank_transfers (transfer_number, transfer_date, from_account_id, to_account_id, amount, currency, exchange_rate, transfer_fee, description, reference_number, status, approved_by) VALUES
-- Internal transfers between company accounts
('BT-20250115-001', '2025-01-15', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 50000000.00, 'IDR', 1.0, 15000.00, 'Transfer dana operasional dari Mandiri ke BCA untuk kebutuhan harian', 'TRF-OP-001', 'COMPLETED', 'finance_manager', '2025-01-15 09:15:00', '2025-01-15 09:15:00'),
('BT-20250116-001', '2025-01-16', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 25000000.00, 'IDR', 1.0, 12500.00, 'Transfer dari BNI ke BRI untuk pembayaran supplier wilayah regional', 'TRF-SUP-001', 'COMPLETED', 'purchasing_manager', '2025-01-16 14:30:00', '2025-01-16 14:30:00'),
('BT-20250117-001', '2025-01-17', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', 30000000.00, 'IDR', 1.0, 17500.00, 'Transfer ke CIMB Niaga untuk investasi jangka pendek dan deposito', 'TRF-INV-001', 'COMPLETED', 'investment_manager', '2025-01-17 11:45:00', '2025-01-17 11:45:00'),

-- Payroll distribution transfers
('BT-20250118-001', '2025-01-18', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 85000000.00, 'IDR', 1.0, 25000.00, 'Transfer dana payroll bulan Januari ke rekening khusus BNI', 'TRF-PAY-001', 'COMPLETED', 'hr_manager', '2025-01-18 08:00:00', '2025-01-18 08:00:00'),
('BT-20250119-001', '2025-01-19', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 12500000.00, 'IDR', 1.0, 10000.00, 'Transfer tambahan untuk tunjangan dan overtime karyawan', 'TRF-PAY-002', 'COMPLETED', 'hr_manager', '2025-01-19 16:20:00', '2025-01-19 16:20:00'),

-- Cash to bank transfers (cash deposit)
('BT-20250120-001', '2025-01-20', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 15000000.00, 'IDR', 1.0, 0.00, 'Setoran kas harian dari kantor pusat ke Bank Mandiri', 'DEP-CASH-001', 'COMPLETED', 'cashier_jakarta', '2025-01-20 15:30:00', '2025-01-20 15:30:00'),
('BT-20250121-001', '2025-01-21', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 8500000.00, 'IDR', 1.0, 0.00, 'Setoran kas toko Bandung ke Bank BCA', 'DEP-CASH-002', 'COMPLETED', 'cashier_bandung', '2025-01-21 17:00:00', '2025-01-21 17:00:00'),
('BT-20250122-001', '2025-01-22', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440006', 6200000.00, 'IDR', 1.0, 0.00, 'Setoran kas toko Surabaya ke Bank BRI', 'DEP-CASH-003', 'COMPLETED', 'cashier_surabaya', '2025-01-22 16:45:00', '2025-01-22 16:45:00'),

-- Bank to cash transfers (cash withdrawal)
('BT-20250123-001', '2025-01-23', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 5000000.00, 'IDR', 1.0, 5000.00, 'Penarikan tunai BCA untuk operasional toko Bandung', 'WDR-CASH-001', 'COMPLETED', 'store_manager_bandung', '2025-01-23 10:15:00', '2025-01-23 10:15:00'),
('BT-20250124-001', '2025-01-24', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440011', 3000000.00, 'IDR', 1.0, 5000.00, 'Penarikan tunai BNI untuk petty cash kantor', 'WDR-CASH-002', 'COMPLETED', 'admin_manager', '2025-01-24 09:30:00', '2025-01-24 09:30:00'),

-- Emergency and urgent transfers
('BT-20250125-001', '2025-01-25', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 20000000.00, 'IDR', 1.0, 25000.00, 'Transfer darurat dari CIMB ke Mandiri untuk pembayaran supplier urgent', 'TRF-EMG-001', 'COMPLETED', 'ceo', '2025-01-25 12:45:00', '2025-01-25 12:45:00'),
('BT-20250126-001', '2025-01-26', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 15000000.00, 'IDR', 1.0, 22500.00, 'Transfer dari Danamon ke BCA untuk coverage ekspor mendadak', 'TRF-EXP-001', 'COMPLETED', 'export_manager', '2025-01-26 14:20:00', '2025-01-26 14:20:00'),

-- Tax payment preparation transfers
('BT-20250127-001', '2025-01-27', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 18000000.00, 'IDR', 1.0, 15000.00, 'Transfer ke Mandiri untuk persiapan pembayaran pajak', 'TRF-TAX-001', 'COMPLETED', 'tax_manager', '2025-01-27 11:30:00', '2025-01-27 11:30:00'),

-- Investment and savings transfers
('BT-20250128-001', '2025-01-28', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440013', 10000000.00, 'IDR', 1.0, 12500.00, 'Transfer ke OCBC NISP untuk emergency fund cadangan', 'TRF-SAV-001', 'COMPLETED', 'finance_manager', '2025-01-28 15:00:00', '2025-01-28 15:00:00'),
('BT-20250129-001', '2025-01-29', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440015', 8000000.00, 'IDR', 1.0, 10000.00, 'Transfer ke BTN untuk investasi properti jangka panjang', 'TRF-PROP-001', 'COMPLETED', 'investment_manager', '2025-01-29 13:45:00', '2025-01-29 13:45:00'),

-- Facility and regional transfers
('BT-20250130-001', '2025-01-30', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440009', 4000000.00, 'IDR', 1.0, 0.00, 'Transfer dana operasional untuk toko Medan', 'TRF-REG-001', 'COMPLETED', 'regional_manager', '2025-01-30 10:20:00', '2025-01-30 10:20:00'),
('BT-20250131-001', '2025-01-31', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440014', 3500000.00, 'IDR', 1.0, 0.00, 'Transfer dana operasional untuk toko Yogyakarta', 'TRF-REG-002', 'COMPLETED', 'regional_manager', '2025-01-31 16:15:00', '2025-01-31 16:15:00'),

-- Pending transfers
('BT-20250201-001', '2025-02-01', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 35000000.00, 'IDR', 1.0, 20000.00, 'Transfer untuk pembayaran supplier besar bulan Februari', 'TRF-FEB-001', 'PENDING', 'purchasing_manager', '2025-02-01 08:30:00', '2025-02-01 08:30:00'),
('BT-20250202-001', '2025-02-02', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440012', 22000000.00, 'IDR', 1.0, 15000.00, 'Transfer ke Permata untuk pembayaran utilitas dan operasional', 'TRF-UTIL-001', 'PROCESSING', 'facility_manager', '2025-02-02 14:45:00', '2025-02-02 14:45:00'),

-- Failed transfers (for reference)
('BT-20250203-001', '2025-02-03', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 50000000.00, 'IDR', 1.0, 25000.00, 'Transfer gagal karena saldo tidak mencukupi', 'TRF-FAIL-001', 'FAILED', 'finance_manager', '2025-02-03 11:00:00', '2025-02-03 11:00:00');