-- +goose Up
-- Core finance tables for cash/bank management, payments, invoices, AP/AR, disbursements, receipts, transfers

-- Cash/Bank Accounts
CREATE TABLE IF NOT EXISTS cash_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    account_no VARCHAR(100) NOT NULL DEFAULT '',
    balance DECIMAL(19,4) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Financial Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    grand_total DECIMAL(19,4) NOT NULL DEFAULT 0,
    customer_id UUID,
    supplier_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL DEFAULT '',
    cash_bank_id UUID REFERENCES cash_banks(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Accounts Payable
CREATE TABLE IF NOT EXISTS accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    supplier_id UUID,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    balance DECIMAL(19,4) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Accounts Receivable
CREATE TABLE IF NOT EXISTS accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    customer_id UUID,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    balance DECIMAL(19,4) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Cash Disbursements
CREATE TABLE IF NOT EXISTS cash_disbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disbursement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    cash_bank_id UUID REFERENCES cash_banks(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Cash Receipts
CREATE TABLE IF NOT EXISTS cash_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    cash_bank_id UUID REFERENCES cash_banks(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Bank Transfers
CREATE TABLE IF NOT EXISTS bank_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    from_cash_bank_id UUID REFERENCES cash_banks(id),
    to_cash_bank_id UUID REFERENCES cash_banks(id),
    amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Cash Opening Balances
CREATE TABLE IF NOT EXISTS cash_opening_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cash_bank_id UUID REFERENCES cash_banks(id),
    opening_date DATE NOT NULL DEFAULT CURRENT_DATE,
    opening_balance DECIMAL(19,4) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    description TEXT NOT NULL DEFAULT '',
    fiscal_year INTEGER NOT NULL DEFAULT 2026,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_cash_bank_id ON payments(cash_bank_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_supplier_id ON accounts_payable(supplier_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_status ON accounts_payable(status);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_customer_id ON accounts_receivable(customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_status ON accounts_receivable(status);
CREATE INDEX IF NOT EXISTS idx_cash_disbursements_cash_bank_id ON cash_disbursements(cash_bank_id);
CREATE INDEX IF NOT EXISTS idx_cash_receipts_cash_bank_id ON cash_receipts(cash_bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfers_from ON bank_transfers(from_cash_bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfers_to ON bank_transfers(to_cash_bank_id);
CREATE INDEX IF NOT EXISTS idx_cash_opening_balances_cash_bank_id ON cash_opening_balances(cash_bank_id);

-- +goose Down
DROP TABLE IF EXISTS cash_opening_balances;
DROP TABLE IF EXISTS bank_transfers;
DROP TABLE IF EXISTS cash_receipts;
DROP TABLE IF EXISTS cash_disbursements;
DROP TABLE IF EXISTS accounts_receivable;
DROP TABLE IF EXISTS accounts_payable;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS cash_banks;
