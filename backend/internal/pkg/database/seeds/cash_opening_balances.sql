-- Cash Opening Balances - Indonesian Financial Year Setup
-- Opening balances for cash and bank accounts for fiscal year 2025

INSERT INTO cash_opening_balances (cash_bank_id, fiscal_year, opening_date, opening_balance, currency, notes, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 2025, '2025-01-01', 25000000.00, 'IDR', 'Saldo awal kas utama kantor pusat untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440002', 2025, '2025-01-01', 10000000.00, 'IDR', 'Saldo awal kas toko Bandung untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440003', 2025, '2025-01-01', 150000000.00, 'IDR', 'Saldo awal Bank Mandiri Jakarta Pusat untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440004', 2025, '2025-01-01', 75000000.00, 'IDR', 'Saldo awal Bank BCA Sudirman untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440005', 2025, '2025-01-01', 50000000.00, 'IDR', 'Saldo awal Bank BNI Senayan untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440006', 2025, '2025-01-01', 30000000.00, 'IDR', 'Saldo awal Bank BRI Thamrin untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440007', 2025, '2025-01-01', 8000000.00, 'IDR', 'Saldo awal kas toko Surabaya untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440008', 2025, '2025-01-01', 25000000.00, 'IDR', 'Saldo awal Bank CIMB Niaga Kuningan untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440009', 2025, '2025-01-01', 6000000.00, 'IDR', 'Saldo awal kas toko Medan untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440010', 2025, '2025-01-01', 40000000.00, 'IDR', 'Saldo awal Bank Danamon Plaza Indonesia untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440011', 2025, '2025-01-01', 2000000.00, 'IDR', 'Saldo awal petty cash HR untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440012', 2025, '2025-01-01', 35000000.00, 'IDR', 'Saldo awal Bank Permata Senopati untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440013', 2025, '2025-01-01', 20000000.00, 'IDR', 'Saldo awal Bank OCBC NISP Kemang untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440014', 2025, '2025-01-01', 5000000.00, 'IDR', 'Saldo awal kas toko Yogyakarta untuk tahun 2025', true),
('550e8400-e29b-41d4-a716-446655440015', 2025, '2025-01-01', 15000000.00, 'IDR', 'Saldo awal Bank BTN Kelapa Gading untuk tahun 2025', true),

-- Previous year closing balances (2024)
('550e8400-e29b-41d4-a716-446655440001', 2024, '2024-01-01', 20000000.00, 'IDR', 'Saldo awal kas utama kantor pusat untuk tahun 2024', false, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
('550e8400-e29b-41d4-a716-446655440003', 2024, '2024-01-01', 120000000.00, 'IDR', 'Saldo awal Bank Mandiri Jakarta Pusat untuk tahun 2024', false, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
('550e8400-e29b-41d4-a716-446655440004', 2024, '2024-01-01', 60000000.00, 'IDR', 'Saldo awal Bank BCA Sudirman untuk tahun 2024', false, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
('550e8400-e29b-41d4-a716-446655440005', 2024, '2024-01-01', 40000000.00, 'IDR', 'Saldo awal Bank BNI Senayan untuk tahun 2024', false, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
('550e8400-e29b-41d4-a716-446655440006', 2024, '2024-01-01', 25000000.00, 'IDR', 'Saldo awal Bank BRI Thamrin untuk tahun 2024', false, '2024-01-01 00:00:00', '2024-12-31 23:59:59');