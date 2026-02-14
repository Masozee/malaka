-- +goose Up
-- Tax Master Data (tax codes/rates)
CREATE TABLE IF NOT EXISTS taxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_code VARCHAR(20) NOT NULL UNIQUE,
    tax_name VARCHAR(100) NOT NULL,
    tax_type VARCHAR(20) NOT NULL DEFAULT 'VAT',
    tax_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
    description TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    tax_account_id UUID,
    expense_account_id UUID,
    company_id VARCHAR(50) NOT NULL DEFAULT '',
    created_by VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tax Transactions (individual tax entries from invoices, receipts, etc.)
CREATE TABLE IF NOT EXISTS tax_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_id UUID NOT NULL REFERENCES taxes(id),
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL DEFAULT 'SALE',
    base_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    reference_type VARCHAR(50) DEFAULT '',
    reference_id VARCHAR(100) DEFAULT '',
    reference_number VARCHAR(100) DEFAULT '',
    customer_id VARCHAR(100) DEFAULT '',
    supplier_id VARCHAR(100) DEFAULT '',
    journal_entry_id UUID,
    company_id VARCHAR(50) NOT NULL DEFAULT '',
    created_by VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tax Returns / Filings (SPT Masa, SPT Tahunan, etc.)
CREATE TABLE IF NOT EXISTS tax_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_number VARCHAR(50) NOT NULL UNIQUE,
    tax_type VARCHAR(20) NOT NULL DEFAULT 'PPN',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    filing_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    total_sales DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_purchases DECIMAL(18,2) NOT NULL DEFAULT 0,
    output_tax DECIMAL(18,2) NOT NULL DEFAULT 0,
    input_tax DECIMAL(18,2) NOT NULL DEFAULT 0,
    tax_payable DECIMAL(18,2) NOT NULL DEFAULT 0,
    tax_paid DECIMAL(18,2) NOT NULL DEFAULT 0,
    penalty_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    interest_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_due DECIMAL(18,2) NOT NULL DEFAULT 0,
    submitted_by VARCHAR(100) DEFAULT '',
    submitted_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    company_id VARCHAR(50) NOT NULL DEFAULT '',
    created_by VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_taxes_company_id ON taxes(company_id);
CREATE INDEX IF NOT EXISTS idx_taxes_tax_type ON taxes(tax_type);
CREATE INDEX IF NOT EXISTS idx_taxes_is_active ON taxes(is_active);
CREATE INDEX IF NOT EXISTS idx_taxes_tax_code ON taxes(tax_code);

CREATE INDEX IF NOT EXISTS idx_tax_transactions_tax_id ON tax_transactions(tax_id);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_company_id ON tax_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_transaction_date ON tax_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_transaction_type ON tax_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_reference ON tax_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_customer ON tax_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_supplier ON tax_transactions(supplier_id);

CREATE INDEX IF NOT EXISTS idx_tax_returns_company_id ON tax_returns(company_id);
CREATE INDEX IF NOT EXISTS idx_tax_returns_tax_type ON tax_returns(tax_type);
CREATE INDEX IF NOT EXISTS idx_tax_returns_status ON tax_returns(status);
CREATE INDEX IF NOT EXISTS idx_tax_returns_due_date ON tax_returns(due_date);
CREATE INDEX IF NOT EXISTS idx_tax_returns_period ON tax_returns(period_start, period_end);

-- +goose Down
DROP TABLE IF EXISTS tax_returns;
DROP TABLE IF EXISTS tax_transactions;
DROP TABLE IF EXISTS taxes;
