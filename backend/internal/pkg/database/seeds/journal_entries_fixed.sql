-- Journal Entries seed data for realistic business transactions
-- This creates proper double-entry transactions for trial balance generation

-- First, create journal entries with proper UUID references (matching actual table structure)
INSERT INTO journal_entries (id, entry_number, reference, description, entry_date, total_debit, total_credit, status, created_by, posted_by, posted_at, created_at, updated_at, company_id) VALUES

-- July 2024 Opening Balance Entry
('11111111-1111-1111-1111-111111111001', 'JE-2024-001', 'OPENING-001', 'Saldo awal bulan Juli 2024', '2024-07-01', 250000000, 250000000, 'POSTED', 'admin', 'admin', '2024-07-01 08:00:00', '2024-07-01 08:00:00', '2024-07-01 08:00:00', '1'),

-- Sales Transaction - July 3
('11111111-1111-1111-1111-111111111002', 'JE-2024-002', 'INV-001', 'Penjualan sepatu tunai', '2024-07-03', 15000000, 15000000, 'POSTED', 'admin', 'admin', '2024-07-03 14:30:00', '2024-07-03 14:30:00', '2024-07-03 14:30:00', '1'),

-- Purchase Transaction - July 5  
('11111111-1111-1111-1111-111111111003', 'JE-2024-003', 'PO-001', 'Pembelian persediaan dari supplier', '2024-07-05', 25000000, 25000000, 'POSTED', 'admin', 'admin', '2024-07-05 10:15:00', '2024-07-05 10:15:00', '2024-07-05 10:15:00', '1'),

-- Salary Payment - July 15
('11111111-1111-1111-1111-111111111004', 'JE-2024-004', 'PAY-001', 'Pembayaran gaji karyawan Juli', '2024-07-15', 18000000, 18000000, 'POSTED', 'admin', 'admin', '2024-07-15 16:45:00', '2024-07-15 16:45:00', '2024-07-15 16:45:00', '1'),

-- Operating Expenses - July 20
('11111111-1111-1111-1111-111111111005', 'JE-2024-005', 'EXP-001', 'Biaya operasional (sewa + listrik)', '2024-07-20', 12000000, 12000000, 'POSTED', 'admin', 'admin', '2024-07-20 11:20:00', '2024-07-20 11:20:00', '2024-07-20 11:20:00', '1'),

-- Customer Payment - July 25
('11111111-1111-1111-1111-111111111006', 'JE-2024-006', 'RCP-001', 'Penerimaan piutang dari pelanggan', '2024-07-25', 8000000, 8000000, 'POSTED', 'admin', 'admin', '2024-07-25 13:10:00', '2024-07-25 13:10:00', '2024-07-25 13:10:00', '1');

-- Now create the journal entry lines for double-entry bookkeeping
INSERT INTO journal_entry_lines (id, journal_entry_id, line_number, account_id, description, debit_amount, credit_amount, created_at, updated_at) VALUES

-- JE-2024-001: Opening Balance Entry
('22222222-2222-2222-2222-222222222001', '11111111-1111-1111-1111-111111111001', 1, (SELECT id FROM chart_of_accounts WHERE account_code = '1112'), 'Saldo awal kas bank BCA', 50000000, 0, '2024-07-01 08:00:00', '2024-07-01 08:00:00'),
('22222222-2222-2222-2222-222222222002', '11111111-1111-1111-1111-111111111001', 2, (SELECT id FROM chart_of_accounts WHERE account_code = '1131'), 'Saldo awal persediaan sepatu', 80000000, 0, '2024-07-01 08:00:00', '2024-07-01 08:00:00'),
('22222222-2222-2222-2222-222222222003', '11111111-1111-1111-1111-111111111001', 3, (SELECT id FROM chart_of_accounts WHERE account_code = '1230'), 'Saldo awal peralatan kantor', 40000000, 0, '2024-07-01 08:00:00', '2024-07-01 08:00:00'),
('22222222-2222-2222-2222-222222222004', '11111111-1111-1111-1111-111111111001', 4, (SELECT id FROM chart_of_accounts WHERE account_code = '1220'), 'Saldo awal kendaraan', 80000000, 0, '2024-07-01 08:00:00', '2024-07-01 08:00:00'),
('22222222-2222-2222-2222-222222222005', '11111111-1111-1111-1111-111111111001', 5, (SELECT id FROM chart_of_accounts WHERE account_code = '3100'), 'Modal saham awal', 0, 200000000, '2024-07-01 08:00:00', '2024-07-01 08:00:00'),
('22222222-2222-2222-2222-222222222006', '11111111-1111-1111-1111-111111111001', 6, (SELECT id FROM chart_of_accounts WHERE account_code = '3200'), 'Laba ditahan awal', 0, 50000000, '2024-07-01 08:00:00', '2024-07-01 08:00:00'),

-- JE-2024-002: Sales Transaction
('22222222-2222-2222-2222-222222222007', '11111111-1111-1111-1111-111111111002', 1, (SELECT id FROM chart_of_accounts WHERE account_code = '1111'), 'Penerimaan kas dari penjualan', 15000000, 0, '2024-07-03 14:30:00', '2024-07-03 14:30:00'),
('22222222-2222-2222-2222-222222222008', '11111111-1111-1111-1111-111111111002', 2, (SELECT id FROM chart_of_accounts WHERE account_code = '4110'), 'Pendapatan penjualan sepatu', 0, 15000000, '2024-07-03 14:30:00', '2024-07-03 14:30:00'),

-- JE-2024-003: Purchase Transaction
('22222222-2222-2222-2222-222222222009', '11111111-1111-1111-1111-111111111003', 1, (SELECT id FROM chart_of_accounts WHERE account_code = '1131'), 'Pembelian persediaan sepatu', 25000000, 0, '2024-07-05 10:15:00', '2024-07-05 10:15:00'),
('22222222-2222-2222-2222-222222222010', '11111111-1111-1111-1111-111111111003', 2, (SELECT id FROM chart_of_accounts WHERE account_code = '2110'), 'Hutang kepada supplier', 0, 25000000, '2024-07-05 10:15:00', '2024-07-05 10:15:00'),

-- JE-2024-004: Salary Payment
('22222222-2222-2222-2222-222222222011', '11111111-1111-1111-1111-111111111004', 1, (SELECT id FROM chart_of_accounts WHERE account_code = '5210'), 'Beban gaji karyawan', 18000000, 0, '2024-07-15 16:45:00', '2024-07-15 16:45:00'),
('22222222-2222-2222-2222-222222222012', '11111111-1111-1111-1111-111111111004', 2, (SELECT id FROM chart_of_accounts WHERE account_code = '1112'), 'Pembayaran gaji via bank', 0, 18000000, '2024-07-15 16:45:00', '2024-07-15 16:45:00'),

-- JE-2024-005: Operating Expenses
('22222222-2222-2222-2222-222222222013', '11111111-1111-1111-1111-111111111005', 1, (SELECT id FROM chart_of_accounts WHERE account_code = '5220'), 'Biaya sewa gedung', 8000000, 0, '2024-07-20 11:20:00', '2024-07-20 11:20:00'),
('22222222-2222-2222-2222-222222222014', '11111111-1111-1111-1111-111111111005', 2, (SELECT id FROM chart_of_accounts WHERE account_code = '5230'), 'Biaya listrik dan air', 4000000, 0, '2024-07-20 11:20:00', '2024-07-20 11:20:00'),
('22222222-2222-2222-2222-222222222015', '11111111-1111-1111-1111-111111111005', 3, (SELECT id FROM chart_of_accounts WHERE account_code = '1111'), 'Pembayaran tunai', 0, 12000000, '2024-07-20 11:20:00', '2024-07-20 11:20:00'),

-- JE-2024-006: Customer Payment  
('22222222-2222-2222-2222-222222222016', '11111111-1111-1111-1111-111111111006', 1, (SELECT id FROM chart_of_accounts WHERE account_code = '1112'), 'Penerimaan piutang via bank', 8000000, 0, '2024-07-25 13:10:00', '2024-07-25 13:10:00'),
('22222222-2222-2222-2222-222222222017', '11111111-1111-1111-1111-111111111006', 2, (SELECT id FROM chart_of_accounts WHERE account_code = '1121'), 'Pelunasan piutang dagang', 0, 8000000, '2024-07-25 13:10:00', '2024-07-25 13:10:00');