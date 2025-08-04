-- +goose Up
-- Create journal entries tables that match the domain entities

-- Journal Entries (main table)
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'POSTED', 'REVERSED')) DEFAULT 'DRAFT',
    total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'IDR',
    exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1.0,
    base_total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
    base_total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
    source_module VARCHAR(50),
    source_id VARCHAR(255),
    posted_by VARCHAR(255),
    posted_at TIMESTAMP WITH TIME ZONE,
    reversed_by VARCHAR(255),
    reversed_at TIMESTAMP WITH TIME ZONE,
    company_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal Entry Lines (detail table)
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    description TEXT,
    debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    credit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    base_debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    base_credit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT journal_entry_lines_unique_line UNIQUE(journal_entry_id, line_number),
    CONSTRAINT journal_entry_lines_debit_or_credit CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR 
        (debit_amount = 0 AND credit_amount > 0)
    )
);

-- Auto Journal Configuration (for mapping transactions to journal entries)
CREATE TABLE auto_journal_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_module VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(100) NOT NULL,
    account_mapping JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_module, transaction_type)
);

-- Auto Journal Log (for tracking auto-generated journal entries)
CREATE TABLE auto_journal_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    source_module VARCHAR(50) NOT NULL,
    source_id VARCHAR(255) NOT NULL,
    transaction_type VARCHAR(100) NOT NULL,
    transaction_data JSONB,
    processing_status VARCHAR(20) DEFAULT 'PENDING' CHECK (processing_status IN ('PENDING', 'PROCESSED', 'FAILED', 'SKIPPED')),
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_company_id ON journal_entries(company_id);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_source ON journal_entries(source_module, source_id);
CREATE INDEX idx_journal_entries_entry_number ON journal_entries(entry_number);

CREATE INDEX idx_journal_entry_lines_entry_id ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_entry_lines_account_id ON journal_entry_lines(account_id);

CREATE INDEX idx_auto_journal_config_module ON auto_journal_config(source_module);
CREATE INDEX idx_auto_journal_log_source ON auto_journal_log(source_module, source_id);
CREATE INDEX idx_auto_journal_log_status ON auto_journal_log(processing_status);

-- +goose Down
DROP TABLE IF EXISTS auto_journal_log;
DROP TABLE IF EXISTS auto_journal_config;
DROP TABLE IF EXISTS journal_entry_lines;
DROP TABLE IF EXISTS journal_entries;