-- General Ledger seed data
-- This data is derived from journal_entries_corrected.sql
-- Each journal entry line creates a corresponding general ledger entry

-- Clear existing general ledger data
DELETE FROM general_ledger WHERE company_id = '1';

-- Insert general ledger entries based on journal entries
INSERT INTO general_ledger (
    id, account_id, journal_entry_id, transaction_date, description, reference,
    debit_amount, credit_amount, balance, currency_code, exchange_rate,
    base_debit_amount, base_credit_amount, company_id, created_by, created_at, updated_at
) VALUES
-- JE-2024-001: Opening Balance Entry (July 1, 2024)
-- Kas (1101) - Debit 50,000,000
('aaaaaaaa-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111001', '2024-07-01', 'Saldo awal kas', 'OPENING-001', 50000000, 0, 50000000, 'IDR', 1, 50000000, 0, '1', 'admin', '2024-07-01 08:00:00', '2024-07-01 08:00:00'),
-- Bank BCA (1102) - Debit 80,000,000
('aaaaaaaa-0001-0001-0001-000000000002', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111001', '2024-07-01', 'Saldo awal bank BCA', 'OPENING-001', 80000000, 0, 80000000, 'IDR', 1, 80000000, 0, '1', 'admin', '2024-07-01 08:00:00', '2024-07-01 08:00:00'),
-- Persediaan (1301) - Debit 70,000,000
('aaaaaaaa-0001-0001-0001-000000000003', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111001', '2024-07-01', 'Saldo awal persediaan', 'OPENING-001', 70000000, 0, 70000000, 'IDR', 1, 70000000, 0, '1', 'admin', '2024-07-01 08:00:00', '2024-07-01 08:00:00'),
-- Modal Saham (3101) - Credit 200,000,000
('aaaaaaaa-0001-0001-0001-000000000004', '31111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111001', '2024-07-01', 'Modal awal perusahaan', 'OPENING-001', 0, 200000000, -200000000, 'IDR', 1, 0, 200000000, '1', 'admin', '2024-07-01 08:00:00', '2024-07-01 08:00:00'),

-- JE-2024-002: Cash Sales (July 3, 2024)
-- Kas (1101) - Debit 15,000,000
('aaaaaaaa-0002-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111002', '2024-07-03', 'Penerimaan kas dari penjualan', 'INV-001', 15000000, 0, 65000000, 'IDR', 1, 15000000, 0, '1', 'admin', '2024-07-03 14:30:00', '2024-07-03 14:30:00'),
-- Pendapatan Penjualan (4101) - Credit 15,000,000
('aaaaaaaa-0002-0001-0001-000000000002', '99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111002', '2024-07-03', 'Pendapatan penjualan sepatu', 'INV-001', 0, 15000000, -15000000, 'IDR', 1, 0, 15000000, '1', 'admin', '2024-07-03 14:30:00', '2024-07-03 14:30:00'),

-- JE-2024-003: Purchase Transaction (July 5, 2024)
-- Persediaan (1301) - Debit 25,000,000
('aaaaaaaa-0003-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111003', '2024-07-05', 'Pembelian persediaan', 'PO-001', 25000000, 0, 95000000, 'IDR', 1, 25000000, 0, '1', 'admin', '2024-07-05 10:15:00', '2024-07-05 10:15:00'),
-- Utang Dagang (2101) - Credit 25,000,000
('aaaaaaaa-0003-0001-0001-000000000002', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111003', '2024-07-05', 'Hutang kepada supplier', 'PO-001', 0, 25000000, -25000000, 'IDR', 1, 0, 25000000, '1', 'admin', '2024-07-05 10:15:00', '2024-07-05 10:15:00'),

-- JE-2024-004: Salary Payment (July 15, 2024)
-- Biaya Gaji (5201) - Debit 18,000,000
('aaaaaaaa-0004-0001-0001-000000000001', '88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111004', '2024-07-15', 'Beban gaji karyawan', 'PAY-001', 18000000, 0, 18000000, 'IDR', 1, 18000000, 0, '1', 'admin', '2024-07-15 16:45:00', '2024-07-15 16:45:00'),
-- Bank BCA (1102) - Credit 18,000,000
('aaaaaaaa-0004-0001-0001-000000000002', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111004', '2024-07-15', 'Pembayaran gaji via bank', 'PAY-001', 0, 18000000, 62000000, 'IDR', 1, 0, 18000000, '1', 'admin', '2024-07-15 16:45:00', '2024-07-15 16:45:00'),

-- JE-2024-005: Utility Payment (July 20, 2024)
-- Biaya Listrik (5203) - Debit 3,000,000
('aaaaaaaa-0005-0001-0001-000000000001', '52222222-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111005', '2024-07-20', 'Pembayaran listrik', 'UTIL-001', 3000000, 0, 3000000, 'IDR', 1, 3000000, 0, '1', 'admin', '2024-07-20 11:00:00', '2024-07-20 11:00:00'),
-- Biaya Telepon (5205) - Debit 2,000,000
('aaaaaaaa-0005-0001-0001-000000000002', '52444444-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111005', '2024-07-20', 'Pembayaran telepon', 'UTIL-001', 2000000, 0, 2000000, 'IDR', 1, 2000000, 0, '1', 'admin', '2024-07-20 11:00:00', '2024-07-20 11:00:00'),
-- Bank BCA (1102) - Credit 5,000,000
('aaaaaaaa-0005-0001-0001-000000000003', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111005', '2024-07-20', 'Pembayaran utilitas via bank', 'UTIL-001', 0, 5000000, 57000000, 'IDR', 1, 0, 5000000, '1', 'admin', '2024-07-20 11:00:00', '2024-07-20 11:00:00'),

-- JE-2024-006: Credit Sales (July 25, 2024)
-- Piutang Dagang (1201) - Debit 22,000,000
('aaaaaaaa-0006-0001-0001-000000000001', '12111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111006', '2024-07-25', 'Piutang dari penjualan kredit', 'INV-002', 22000000, 0, 22000000, 'IDR', 1, 22000000, 0, '1', 'admin', '2024-07-25 09:30:00', '2024-07-25 09:30:00'),
-- Pendapatan Penjualan (4101) - Credit 22,000,000
('aaaaaaaa-0006-0001-0001-000000000002', '99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111006', '2024-07-25', 'Pendapatan penjualan kredit', 'INV-002', 0, 22000000, -37000000, 'IDR', 1, 0, 22000000, '1', 'admin', '2024-07-25 09:30:00', '2024-07-25 09:30:00')

ON CONFLICT (id) DO UPDATE SET
    account_id = EXCLUDED.account_id,
    journal_entry_id = EXCLUDED.journal_entry_id,
    transaction_date = EXCLUDED.transaction_date,
    description = EXCLUDED.description,
    reference = EXCLUDED.reference,
    debit_amount = EXCLUDED.debit_amount,
    credit_amount = EXCLUDED.credit_amount,
    balance = EXCLUDED.balance;
