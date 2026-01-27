-- Journal Entries seed data for realistic business transactions
-- Using ACTUAL account IDs from chart_of_accounts.sql seed file

-- First, create journal entries
INSERT INTO journal_entries (id, entry_number, reference, description, entry_date, total_debit, total_credit, status, created_by, posted_by, posted_at, created_at, updated_at, company_id) VALUES

-- July 2024 Opening Balance Entry
('11111111-1111-1111-1111-111111111001', 'JE-2024-001', 'OPENING-001', 'Saldo awal bulan Juli 2024', '2024-07-01', 200000000, 200000000, 'POSTED', 'admin', 'admin', '2024-07-01 08:00:00', '2024-07-01 08:00:00', '2024-07-01 08:00:00', '1'),

-- Sales Transaction - July 3
('11111111-1111-1111-1111-111111111002', 'JE-2024-002', 'INV-001', 'Penjualan sepatu tunai', '2024-07-03', 15000000, 15000000, 'POSTED', 'admin', 'admin', '2024-07-03 14:30:00', '2024-07-03 14:30:00', '2024-07-03 14:30:00', '1'),

-- Purchase Transaction - July 5
('11111111-1111-1111-1111-111111111003', 'JE-2024-003', 'PO-001', 'Pembelian persediaan dari supplier', '2024-07-05', 25000000, 25000000, 'POSTED', 'admin', 'admin', '2024-07-05 10:15:00', '2024-07-05 10:15:00', '2024-07-05 10:15:00', '1'),

-- Salary Payment - July 15
('11111111-1111-1111-1111-111111111004', 'JE-2024-004', 'PAY-001', 'Pembayaran gaji karyawan Juli', '2024-07-15', 18000000, 18000000, 'POSTED', 'admin', 'admin', '2024-07-15 16:45:00', '2024-07-15 16:45:00', '2024-07-15 16:45:00', '1'),

-- Utility Payment - July 20
('11111111-1111-1111-1111-111111111005', 'JE-2024-005', 'UTIL-001', 'Pembayaran listrik dan telepon', '2024-07-20', 5000000, 5000000, 'POSTED', 'admin', 'admin', '2024-07-20 11:00:00', '2024-07-20 11:00:00', '2024-07-20 11:00:00', '1'),

-- Sales Transaction - July 25
('11111111-1111-1111-1111-111111111006', 'JE-2024-006', 'INV-002', 'Penjualan sepatu kredit', '2024-07-25', 22000000, 22000000, 'POSTED', 'admin', 'admin', '2024-07-25 09:30:00', '2024-07-25 09:30:00', '2024-07-25 09:30:00', '1')

ON CONFLICT (id) DO UPDATE SET
    entry_number = EXCLUDED.entry_number,
    reference = EXCLUDED.reference,
    description = EXCLUDED.description,
    entry_date = EXCLUDED.entry_date,
    total_debit = EXCLUDED.total_debit,
    total_credit = EXCLUDED.total_credit,
    status = EXCLUDED.status;

-- Now create the journal entry lines using ACTUAL account IDs from chart_of_accounts.sql
INSERT INTO journal_entry_lines (id, journal_entry_id, line_number, account_id, description, debit_amount, credit_amount, created_at, updated_at) VALUES

-- JE-2024-001: Opening Balance Entry
-- Debit: Kas (1101) - 50,000,000
('22222222-2222-2222-2222-222222222001', '11111111-1111-1111-1111-111111111001', 1, '11111111-1111-1111-1111-111111111111', 'Saldo awal kas', 50000000, 0, '2024-07-01 08:00:00', '2024-07-01 08:00:00'),
-- Debit: Bank BCA (1102) - 80,000,000
('22222222-2222-2222-2222-222222222002', '11111111-1111-1111-1111-111111111001', 2, '22222222-2222-2222-2222-222222222222', 'Saldo awal bank BCA', 80000000, 0, '2024-07-01 08:00:00', '2024-07-01 08:00:00'),
-- Debit: Persediaan (1301) - 70,000,000
('22222222-2222-2222-2222-222222222003', '11111111-1111-1111-1111-111111111001', 3, '44444444-4444-4444-4444-444444444444', 'Saldo awal persediaan', 70000000, 0, '2024-07-01 08:00:00', '2024-07-01 08:00:00'),
-- Credit: Modal Saham (3101) - 200,000,000
('22222222-2222-2222-2222-222222222004', '11111111-1111-1111-1111-111111111001', 4, '31111111-1111-1111-1111-111111111111', 'Modal awal perusahaan', 0, 200000000, '2024-07-01 08:00:00', '2024-07-01 08:00:00'),

-- JE-2024-002: Sales Transaction (Cash sale)
-- Debit: Kas (1101) - 15,000,000
('22222222-2222-2222-2222-222222222005', '11111111-1111-1111-1111-111111111002', 1, '11111111-1111-1111-1111-111111111111', 'Penerimaan kas dari penjualan', 15000000, 0, '2024-07-03 14:30:00', '2024-07-03 14:30:00'),
-- Credit: Pendapatan Penjualan (4101) - 15,000,000
('22222222-2222-2222-2222-222222222006', '11111111-1111-1111-1111-111111111002', 2, '99999999-9999-9999-9999-999999999999', 'Pendapatan penjualan sepatu', 0, 15000000, '2024-07-03 14:30:00', '2024-07-03 14:30:00'),

-- JE-2024-003: Purchase Transaction
-- Debit: Persediaan (1301) - 25,000,000
('22222222-2222-2222-2222-222222222007', '11111111-1111-1111-1111-111111111003', 1, '44444444-4444-4444-4444-444444444444', 'Pembelian persediaan', 25000000, 0, '2024-07-05 10:15:00', '2024-07-05 10:15:00'),
-- Credit: Utang Dagang (2101) - 25,000,000
('22222222-2222-2222-2222-222222222008', '11111111-1111-1111-1111-111111111003', 2, '55555555-5555-5555-5555-555555555555', 'Hutang kepada supplier', 0, 25000000, '2024-07-05 10:15:00', '2024-07-05 10:15:00'),

-- JE-2024-004: Salary Payment
-- Debit: Biaya Gaji (5201) - 18,000,000
('22222222-2222-2222-2222-222222222009', '11111111-1111-1111-1111-111111111004', 1, '88888888-8888-8888-8888-888888888888', 'Beban gaji karyawan', 18000000, 0, '2024-07-15 16:45:00', '2024-07-15 16:45:00'),
-- Credit: Bank BCA (1102) - 18,000,000
('22222222-2222-2222-2222-222222222010', '11111111-1111-1111-1111-111111111004', 2, '22222222-2222-2222-2222-222222222222', 'Pembayaran gaji via bank', 0, 18000000, '2024-07-15 16:45:00', '2024-07-15 16:45:00'),

-- JE-2024-005: Utility Payment
-- Debit: Biaya Listrik (5203) - 3,000,000
('22222222-2222-2222-2222-222222222011', '11111111-1111-1111-1111-111111111005', 1, '52222222-1111-1111-1111-111111111111', 'Pembayaran listrik', 3000000, 0, '2024-07-20 11:00:00', '2024-07-20 11:00:00'),
-- Debit: Biaya Telepon (5205) - 2,000,000
('22222222-2222-2222-2222-222222222012', '11111111-1111-1111-1111-111111111005', 2, '52444444-1111-1111-1111-111111111111', 'Pembayaran telepon', 2000000, 0, '2024-07-20 11:00:00', '2024-07-20 11:00:00'),
-- Credit: Bank BCA (1102) - 5,000,000
('22222222-2222-2222-2222-222222222013', '11111111-1111-1111-1111-111111111005', 3, '22222222-2222-2222-2222-222222222222', 'Pembayaran utilitas via bank', 0, 5000000, '2024-07-20 11:00:00', '2024-07-20 11:00:00'),

-- JE-2024-006: Credit Sales Transaction
-- Debit: Piutang Dagang (1201) - 22,000,000
('22222222-2222-2222-2222-222222222014', '11111111-1111-1111-1111-111111111006', 1, '12111111-1111-1111-1111-111111111111', 'Piutang dari penjualan kredit', 22000000, 0, '2024-07-25 09:30:00', '2024-07-25 09:30:00'),
-- Credit: Pendapatan Penjualan (4101) - 22,000,000
('22222222-2222-2222-2222-222222222015', '11111111-1111-1111-1111-111111111006', 2, '99999999-9999-9999-9999-999999999999', 'Pendapatan penjualan kredit', 0, 22000000, '2024-07-25 09:30:00', '2024-07-25 09:30:00')

ON CONFLICT (id) DO UPDATE SET
    line_number = EXCLUDED.line_number,
    account_id = EXCLUDED.account_id,
    description = EXCLUDED.description,
    debit_amount = EXCLUDED.debit_amount,
    credit_amount = EXCLUDED.credit_amount;

-- Sync to journals table for foreign key constraints (required by general_ledger table)
INSERT INTO journals (id, journal_number, transaction_date, description, total_debit, total_credit, status, reference_type)
SELECT id, entry_number, entry_date, description, total_debit, total_credit, status, 'SEED_SYNC'
FROM journal_entries
ON CONFLICT (id) DO NOTHING;
