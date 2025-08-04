-- Auto Journal Configuration Seed Data
-- This file contains predefined account mappings for automatic journal entry creation

-- First, let's insert some basic chart of accounts if they don't exist
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, is_active) VALUES
-- Assets
('11111111-1111-1111-1111-111111111111', '1101', 'Kas', 'ASSET', true),
('22222222-2222-2222-2222-222222222222', '1102', 'Bank BCA', 'ASSET', true),
('33333333-3333-3333-3333-333333333333', '1201', 'Piutang Dagang', 'ASSET', true),
('44444444-4444-4444-4444-444444444444', '1301', 'Persediaan Barang Dagangan', 'ASSET', true),

-- Liabilities
('55555555-5555-5555-5555-555555555555', '2101', 'Utang Dagang', 'LIABILITY', true),
('66666666-6666-6666-6666-666666666666', '2201', 'Utang PPN', 'LIABILITY', true),
('77777777-7777-7777-7777-777777777777', '2301', 'Utang Gaji', 'LIABILITY', true),
('88888888-8888-8888-8888-888888888888', '2302', 'Utang PPh 21', 'LIABILITY', true),

-- Revenue
('99999999-9999-9999-9999-999999999999', '4101', 'Pendapatan Penjualan', 'REVENUE', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '4201', 'Diskon Penjualan', 'REVENUE', true),

-- Expenses
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5101', 'Harga Pokok Penjualan', 'EXPENSE', true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '6101', 'Biaya Gaji', 'EXPENSE', true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '6201', 'Kerugian Persediaan', 'EXPENSE', true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '4301', 'Keuntungan Persediaan', 'REVENUE', true)
ON CONFLICT (account_code) DO NOTHING;

-- Auto Journal Configuration for Sales POS Cash
INSERT INTO auto_journal_config (
    id, 
    source_module, 
    transaction_type, 
    account_mapping, 
    is_active, 
    description, 
    created_by
) VALUES (
    gen_random_uuid(),
    'SALES',
    'POS_CASH_SALE',
    '{
        "transaction_type": "POS_CASH_SALE",
        "rules": [
            {
                "account_id": "11111111-1111-1111-1111-111111111111",
                "account_type": "DEBIT",
                "amount_field": "net_amount",
                "description": "Kas dari penjualan"
            },
            {
                "account_id": "99999999-9999-9999-9999-999999999999",
                "account_type": "CREDIT",
                "amount_field": "total_amount",
                "description": "Pendapatan penjualan"
            },
            {
                "account_id": "66666666-6666-6666-6666-666666666666",
                "account_type": "CREDIT",
                "amount_field": "tax_amount",
                "description": "PPN terutang"
            },
            {
                "account_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "account_type": "CREDIT",
                "amount_field": "discount_amount",
                "description": "Diskon penjualan"
            }
        ],
        "is_active": true,
        "description": "Jurnal otomatis untuk penjualan tunai POS"
    }',
    true,
    'Jurnal otomatis untuk penjualan tunai POS',
    'system'
);

-- Auto Journal Configuration for Sales POS Card
INSERT INTO auto_journal_config (
    id, 
    source_module, 
    transaction_type, 
    account_mapping, 
    is_active, 
    description, 
    created_by
) VALUES (
    gen_random_uuid(),
    'SALES',
    'POS_CARD_SALE',
    '{
        "transaction_type": "POS_CARD_SALE",
        "rules": [
            {
                "account_id": "22222222-2222-2222-2222-222222222222",
                "account_type": "DEBIT",
                "amount_field": "net_amount",
                "description": "Bank dari penjualan kartu"
            },
            {
                "account_id": "99999999-9999-9999-9999-999999999999",
                "account_type": "CREDIT",
                "amount_field": "total_amount",
                "description": "Pendapatan penjualan"
            },
            {
                "account_id": "66666666-6666-6666-6666-666666666666",
                "account_type": "CREDIT",
                "amount_field": "tax_amount",
                "description": "PPN terutang"
            }
        ],
        "is_active": true,
        "description": "Jurnal otomatis untuk penjualan kartu POS"
    }',
    true,
    'Jurnal otomatis untuk penjualan kartu POS',
    'system'
);

-- Auto Journal Configuration for Purchase Orders
INSERT INTO auto_journal_config (
    id, 
    source_module, 
    transaction_type, 
    account_mapping, 
    is_active, 
    description, 
    created_by
) VALUES (
    gen_random_uuid(),
    'PURCHASE',
    'PURCHASE_ORDER_APPROVED',
    '{
        "transaction_type": "PURCHASE_ORDER_APPROVED",
        "rules": [
            {
                "account_id": "44444444-4444-4444-4444-444444444444",
                "account_type": "DEBIT",
                "amount_field": "total_amount",
                "description": "Persediaan barang dagangan"
            },
            {
                "account_id": "55555555-5555-5555-5555-555555555555",
                "account_type": "CREDIT",
                "amount_field": "net_amount",
                "description": "Utang dagang"
            },
            {
                "account_id": "66666666-6666-6666-6666-666666666666",
                "account_type": "CREDIT",
                "amount_field": "tax_amount",
                "description": "PPN masukan"
            }
        ],
        "is_active": true,
        "description": "Jurnal otomatis untuk purchase order yang disetujui"
    }',
    true,
    'Jurnal otomatis untuk purchase order yang disetujui',
    'system'
);

-- Auto Journal Configuration for Inventory Goods Receipt
INSERT INTO auto_journal_config (
    id, 
    source_module, 
    transaction_type, 
    account_mapping, 
    is_active, 
    description, 
    created_by
) VALUES (
    gen_random_uuid(),
    'INVENTORY',
    'INVENTORY_RECEIPT',
    '{
        "transaction_type": "INVENTORY_RECEIPT",
        "rules": [
            {
                "account_id": "44444444-4444-4444-4444-444444444444",
                "account_type": "DEBIT",
                "amount_field": "total_amount",
                "description": "Persediaan masuk"
            },
            {
                "account_id": "55555555-5555-5555-5555-555555555555",
                "account_type": "CREDIT",
                "amount_field": "total_amount",
                "description": "Utang atas barang diterima"
            }
        ],
        "is_active": true,
        "description": "Jurnal otomatis untuk penerimaan barang"
    }',
    true,
    'Jurnal otomatis untuk penerimaan barang',
    'system'
);

-- Auto Journal Configuration for Inventory Goods Issue (for sales)
INSERT INTO auto_journal_config (
    id, 
    source_module, 
    transaction_type, 
    account_mapping, 
    is_active, 
    description, 
    created_by
) VALUES (
    gen_random_uuid(),
    'INVENTORY',
    'INVENTORY_ISSUE',
    '{
        "transaction_type": "INVENTORY_ISSUE",
        "rules": [
            {
                "account_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                "account_type": "DEBIT",
                "amount_field": "total_amount",
                "description": "Harga pokok penjualan"
            },
            {
                "account_id": "44444444-4444-4444-4444-444444444444",
                "account_type": "CREDIT",
                "amount_field": "total_amount",
                "description": "Persediaan keluar"
            }
        ],
        "is_active": true,
        "description": "Jurnal otomatis untuk pengeluaran barang"
    }',
    true,
    'Jurnal otomatis untuk pengeluaran barang',
    'system'
);

-- Auto Journal Configuration for Inventory Adjustments (Loss/Damage)
INSERT INTO auto_journal_config (
    id, 
    source_module, 
    transaction_type, 
    account_mapping, 
    is_active, 
    description, 
    created_by
) VALUES (
    gen_random_uuid(),
    'INVENTORY',
    'INVENTORY_ADJUSTMENT',
    '{
        "transaction_type": "INVENTORY_ADJUSTMENT",
        "rules": [
            {
                "account_id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
                "account_type": "DEBIT",
                "amount_field": "total_amount",
                "description": "Kerugian persediaan"
            },
            {
                "account_id": "44444444-4444-4444-4444-444444444444",
                "account_type": "CREDIT",
                "amount_field": "total_amount",
                "description": "Persediaan (koreksi)"
            }
        ],
        "is_active": true,
        "description": "Jurnal otomatis untuk penyesuaian persediaan"
    }',
    true,
    'Jurnal otomatis untuk penyesuaian persediaan',
    'system'
);

-- Auto Journal Configuration for Payroll Processing
INSERT INTO auto_journal_config (
    id, 
    source_module, 
    transaction_type, 
    account_mapping, 
    is_active, 
    description, 
    created_by
) VALUES (
    gen_random_uuid(),
    'PAYROLL',
    'PAYROLL_PROCESSING',
    '{
        "transaction_type": "PAYROLL_PROCESSING",
        "rules": [
            {
                "account_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
                "account_type": "DEBIT",
                "amount_field": "total_gross_pay",
                "description": "Biaya gaji dan tunjangan"
            },
            {
                "account_id": "77777777-7777-7777-7777-777777777777",
                "account_type": "CREDIT",
                "amount_field": "total_net_pay",
                "description": "Utang gaji karyawan"
            },
            {
                "account_id": "88888888-8888-8888-8888-888888888888",
                "account_type": "CREDIT",
                "amount_field": "tax_withholding",
                "description": "Utang PPh 21"
            }
        ],
        "is_active": true,
        "description": "Jurnal otomatis untuk pemrosesan penggajian"
    }',
    true,
    'Jurnal otomatis untuk pemrosesan penggajian',
    'system'
);

-- Auto Journal Configuration for Cash Deposits
INSERT INTO auto_journal_config (
    id, 
    source_module, 
    transaction_type, 
    account_mapping, 
    is_active, 
    description, 
    created_by
) VALUES (
    gen_random_uuid(),
    'CASH_BANK',
    'CASH_BANK_DEPOSIT',
    '{
        "transaction_type": "CASH_BANK_DEPOSIT",
        "rules": [
            {
                "account_id": "11111111-1111-1111-1111-111111111111",
                "account_type": "DEBIT",
                "amount_field": "amount",
                "description": "Kas masuk"
            },
            {
                "account_id": "99999999-9999-9999-9999-999999999999",
                "account_type": "CREDIT",
                "amount_field": "amount",
                "description": "Pendapatan lain-lain"
            }
        ],
        "is_active": true,
        "description": "Jurnal otomatis untuk setoran kas"
    }',
    true,
    'Jurnal otomatis untuk setoran kas',
    'system'
);

-- Auto Journal Configuration for Bank Transfers
INSERT INTO auto_journal_config (
    id, 
    source_module, 
    transaction_type, 
    account_mapping, 
    is_active, 
    description, 
    created_by
) VALUES (
    gen_random_uuid(),
    'CASH_BANK',
    'CASH_BANK_TRANSFER',
    '{
        "transaction_type": "CASH_BANK_TRANSFER",
        "rules": [
            {
                "account_id": "22222222-2222-2222-2222-222222222222",
                "account_type": "DEBIT",
                "amount_field": "amount",
                "description": "Bank tujuan"
            },
            {
                "account_id": "11111111-1111-1111-1111-111111111111",
                "account_type": "CREDIT",
                "amount_field": "amount",
                "description": "Kas sumber"
            }
        ],
        "is_active": true,
        "description": "Jurnal otomatis untuk transfer kas ke bank"
    }',
    true,
    'Jurnal otomatis untuk transfer kas ke bank',
    'system'
);