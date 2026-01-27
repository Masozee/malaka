-- Chart of Accounts seed data with consistent IDs and codes
-- These account codes and IDs match the frontend service mappings

-- Clear existing data (if needed, will fail silently if foreign key constraints exist)
-- DELETE FROM chart_of_accounts WHERE id IS NOT NULL;

-- Insert root level accounts first (parent accounts)
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, parent_id, is_active) VALUES
-- Root Level Accounts
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1000', 'HARTA', 'ASSET', NULL, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2000', 'KEWAJIBAN', 'LIABILITY', NULL, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '3000', 'MODAL', 'EQUITY', NULL, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '4000', 'PENDAPATAN', 'REVENUE', NULL, true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '5000', 'BIAYA', 'EXPENSE', NULL, true)
ON CONFLICT (id) DO UPDATE SET
    account_code = EXCLUDED.account_code,
    account_name = EXCLUDED.account_name,
    account_type = EXCLUDED.account_type;

-- Sub-Level Accounts (Level 2)
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, parent_id, is_active) VALUES
-- Asset sub-accounts
('11111111-0000-0000-0000-000000000000', '1100', 'Kas dan Bank', 'ASSET', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true),
('12222222-0000-0000-0000-000000000000', '1200', 'Piutang', 'ASSET', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true),
('13333333-0000-0000-0000-000000000000', '1300', 'Persediaan', 'ASSET', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true),
('14444444-0000-0000-0000-000000000000', '1400', 'Harta Tetap', 'ASSET', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true),
-- Liability sub-accounts
('21111111-0000-0000-0000-000000000000', '2100', 'Hutang Lancar', 'LIABILITY', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),
('22222222-0000-0000-0000-000000000000', '2200', 'Hutang Jangka Panjang', 'LIABILITY', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),
('23333333-0000-0000-0000-000000000000', '2300', 'Hutang Lain-lain', 'LIABILITY', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),
-- Equity sub-accounts
('31111111-0000-0000-0000-000000000000', '3100', 'Modal Disetor', 'EQUITY', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true),
('32222222-0000-0000-0000-000000000000', '3200', 'Laba Ditahan', 'EQUITY', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true),
-- Revenue sub-accounts
('41111111-0000-0000-0000-000000000000', '4100', 'Pendapatan Penjualan', 'REVENUE', 'dddddddd-dddd-dddd-dddd-dddddddddddd', true),
('42222222-0000-0000-0000-000000000000', '4200', 'Pendapatan Lain-lain', 'REVENUE', 'dddddddd-dddd-dddd-dddd-dddddddddddd', true),
-- Expense sub-accounts
('51111111-0000-0000-0000-000000000000', '5100', 'Harga Pokok Penjualan', 'EXPENSE', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', true),
('52222222-0000-0000-0000-000000000000', '5200', 'Biaya Operasional', 'EXPENSE', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', true),
('53333333-0000-0000-0000-000000000000', '5300', 'Biaya Administrasi', 'EXPENSE', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', true)
ON CONFLICT (id) DO UPDATE SET
    account_code = EXCLUDED.account_code,
    account_name = EXCLUDED.account_name,
    account_type = EXCLUDED.account_type,
    parent_id = EXCLUDED.parent_id;

-- Detail Level Accounts (Level 3) - These are the accounts used in transactions
-- IMPORTANT: These IDs and codes must match the frontend service mapping
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, parent_id, is_active) VALUES
-- Cash and Bank accounts (parent: 1100)
('11111111-1111-1111-1111-111111111111', '1101', 'Kas', 'ASSET', '11111111-0000-0000-0000-000000000000', true),
('22222222-2222-2222-2222-222222222222', '1102', 'Bank BCA', 'ASSET', '11111111-0000-0000-0000-000000000000', true),
('33333333-3333-3333-3333-333333333333', '1103', 'Bank Mandiri', 'ASSET', '11111111-0000-0000-0000-000000000000', true),

-- Receivables accounts (parent: 1200)
('12111111-1111-1111-1111-111111111111', '1201', 'Piutang Dagang', 'ASSET', '12222222-0000-0000-0000-000000000000', true),
('12222222-1111-1111-1111-111111111111', '1202', 'Piutang Karyawan', 'ASSET', '12222222-0000-0000-0000-000000000000', true),

-- Inventory accounts (parent: 1300)
('44444444-4444-4444-4444-444444444444', '1301', 'Persediaan Barang Dagangan', 'ASSET', '13333333-0000-0000-0000-000000000000', true),
('13111111-1111-1111-1111-111111111111', '1302', 'Persediaan Bahan Baku', 'ASSET', '13333333-0000-0000-0000-000000000000', true),

-- Fixed Asset accounts (parent: 1400)
('14111111-1111-1111-1111-111111111111', '1401', 'Tanah', 'ASSET', '14444444-0000-0000-0000-000000000000', true),
('14222222-1111-1111-1111-111111111111', '1402', 'Bangunan', 'ASSET', '14444444-0000-0000-0000-000000000000', true),
('14333333-1111-1111-1111-111111111111', '1403', 'Kendaraan', 'ASSET', '14444444-0000-0000-0000-000000000000', true),
('14444444-1111-1111-1111-111111111111', '1404', 'Peralatan Kantor', 'ASSET', '14444444-0000-0000-0000-000000000000', true),

-- Current Liabilities accounts (parent: 2100)
('55555555-5555-5555-5555-555555555555', '2101', 'Utang Dagang', 'LIABILITY', '21111111-0000-0000-0000-000000000000', true),
('21111111-1111-1111-1111-111111111111', '2102', 'Utang Pajak', 'LIABILITY', '21111111-0000-0000-0000-000000000000', true),

-- Long-term Liabilities accounts (parent: 2200)
('22111111-1111-1111-1111-111111111111', '2201', 'Utang Bank', 'LIABILITY', '22222222-0000-0000-0000-000000000000', true),

-- Other Liabilities accounts (parent: 2300)
('77777777-7777-7777-7777-777777777777', '2301', 'Utang Gaji', 'LIABILITY', '23333333-0000-0000-0000-000000000000', true),
('23111111-1111-1111-1111-111111111111', '2302', 'Utang Lain-lain', 'LIABILITY', '23333333-0000-0000-0000-000000000000', true),

-- Capital accounts (parent: 3100)
('31111111-1111-1111-1111-111111111111', '3101', 'Modal Saham', 'EQUITY', '31111111-0000-0000-0000-000000000000', true),
('31222222-1111-1111-1111-111111111111', '3102', 'Agio Saham', 'EQUITY', '31111111-0000-0000-0000-000000000000', true),

-- Retained Earnings accounts (parent: 3200)
('32111111-1111-1111-1111-111111111111', '3201', 'Laba Tahun Berjalan', 'EQUITY', '32222222-0000-0000-0000-000000000000', true),
('32222222-1111-1111-1111-111111111111', '3202', 'Laba Tahun Lalu', 'EQUITY', '32222222-0000-0000-0000-000000000000', true),

-- Sales Revenue accounts (parent: 4100)
('99999999-9999-9999-9999-999999999999', '4101', 'Pendapatan Penjualan', 'REVENUE', '41111111-0000-0000-0000-000000000000', true),
('41111111-1111-1111-1111-111111111111', '4102', 'Diskon Penjualan', 'REVENUE', '41111111-0000-0000-0000-000000000000', true),
('41222222-1111-1111-1111-111111111111', '4103', 'Retur Penjualan', 'REVENUE', '41111111-0000-0000-0000-000000000000', true),

-- Other Revenue accounts (parent: 4200)
('42111111-1111-1111-1111-111111111111', '4201', 'Pendapatan Bunga', 'REVENUE', '42222222-0000-0000-0000-000000000000', true),
('42222222-1111-1111-1111-111111111111', '4202', 'Pendapatan Lain-lain', 'REVENUE', '42222222-0000-0000-0000-000000000000', true),

-- COGS accounts (parent: 5100)
('51111111-1111-1111-1111-111111111111', '5101', 'HPP Sepatu', 'EXPENSE', '51111111-0000-0000-0000-000000000000', true),
('51222222-1111-1111-1111-111111111111', '5102', 'HPP Sandal', 'EXPENSE', '51111111-0000-0000-0000-000000000000', true),

-- Operating Expense accounts (parent: 5200)
('88888888-8888-8888-8888-888888888888', '5201', 'Biaya Gaji', 'EXPENSE', '52222222-0000-0000-0000-000000000000', true),
('52111111-1111-1111-1111-111111111111', '5202', 'Biaya Sewa', 'EXPENSE', '52222222-0000-0000-0000-000000000000', true),
('52222222-1111-1111-1111-111111111111', '5203', 'Biaya Listrik', 'EXPENSE', '52222222-0000-0000-0000-000000000000', true),
('52333333-1111-1111-1111-111111111111', '5204', 'Biaya Transportasi', 'EXPENSE', '52222222-0000-0000-0000-000000000000', true),
('52444444-1111-1111-1111-111111111111', '5205', 'Biaya Telepon', 'EXPENSE', '52222222-0000-0000-0000-000000000000', true),

-- Administrative Expense accounts (parent: 5300)
('53111111-1111-1111-1111-111111111111', '5301', 'Biaya ATK', 'EXPENSE', '53333333-0000-0000-0000-000000000000', true),
('53222222-1111-1111-1111-111111111111', '5302', 'Biaya Penyusutan', 'EXPENSE', '53333333-0000-0000-0000-000000000000', true)
ON CONFLICT (id) DO UPDATE SET
    account_code = EXCLUDED.account_code,
    account_name = EXCLUDED.account_name,
    account_type = EXCLUDED.account_type,
    parent_id = EXCLUDED.parent_id;
