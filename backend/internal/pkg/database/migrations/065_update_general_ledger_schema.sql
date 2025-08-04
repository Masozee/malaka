-- +goose Up
-- Update general ledger table to match entity structure

-- Add new columns to match GeneralLedger entity
ALTER TABLE general_ledger ADD COLUMN IF NOT EXISTS reference VARCHAR(255);
ALTER TABLE general_ledger ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3) DEFAULT 'IDR';
ALTER TABLE general_ledger ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4) DEFAULT 1.0;
ALTER TABLE general_ledger ADD COLUMN IF NOT EXISTS base_debit_amount DECIMAL(15,2) DEFAULT 0;
ALTER TABLE general_ledger ADD COLUMN IF NOT EXISTS base_credit_amount DECIMAL(15,2) DEFAULT 0;
ALTER TABLE general_ledger ADD COLUMN IF NOT EXISTS company_id VARCHAR(255);
ALTER TABLE general_ledger ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE general_ledger ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Rename journal_id to journal_entry_id to match entity expectations
ALTER TABLE general_ledger RENAME COLUMN journal_id TO journal_entry_id;

-- Update the foreign key constraint to reference journals table
ALTER TABLE general_ledger DROP CONSTRAINT IF EXISTS general_ledger_journal_id_fkey;
ALTER TABLE general_ledger ADD CONSTRAINT general_ledger_journal_entry_id_fkey 
    FOREIGN KEY (journal_entry_id) REFERENCES journals(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_general_ledger_account_id ON general_ledger(account_id);
CREATE INDEX IF NOT EXISTS idx_general_ledger_journal_entry_id ON general_ledger(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_general_ledger_transaction_date ON general_ledger(transaction_date);
CREATE INDEX IF NOT EXISTS idx_general_ledger_company_id ON general_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_general_ledger_reference ON general_ledger(reference);

-- Add constraint to ensure either debit or credit amount is provided, not both
ALTER TABLE general_ledger ADD CONSTRAINT chk_general_ledger_amounts 
    CHECK ((debit_amount > 0 AND credit_amount = 0) OR (debit_amount = 0 AND credit_amount > 0));

-- Add constraint to ensure exchange rate is positive
ALTER TABLE general_ledger ADD CONSTRAINT chk_general_ledger_exchange_rate 
    CHECK (exchange_rate > 0);

-- +goose Down
-- Remove constraints
ALTER TABLE general_ledger DROP CONSTRAINT IF EXISTS chk_general_ledger_exchange_rate;
ALTER TABLE general_ledger DROP CONSTRAINT IF EXISTS chk_general_ledger_amounts;

-- Remove indexes
DROP INDEX IF EXISTS idx_general_ledger_reference;
DROP INDEX IF EXISTS idx_general_ledger_company_id;
DROP INDEX IF EXISTS idx_general_ledger_transaction_date;
DROP INDEX IF EXISTS idx_general_ledger_journal_entry_id;
DROP INDEX IF EXISTS idx_general_ledger_account_id;

-- Restore original foreign key constraint
ALTER TABLE general_ledger DROP CONSTRAINT IF EXISTS general_ledger_journal_entry_id_fkey;
ALTER TABLE general_ledger ADD CONSTRAINT general_ledger_journal_id_fkey 
    FOREIGN KEY (journal_entry_id) REFERENCES journals(id);

-- Rename back to original column name
ALTER TABLE general_ledger RENAME COLUMN journal_entry_id TO journal_id;

-- Remove new columns
ALTER TABLE general_ledger DROP COLUMN IF EXISTS updated_at;
ALTER TABLE general_ledger DROP COLUMN IF EXISTS created_by;
ALTER TABLE general_ledger DROP COLUMN IF EXISTS company_id;
ALTER TABLE general_ledger DROP COLUMN IF EXISTS base_credit_amount;
ALTER TABLE general_ledger DROP COLUMN IF EXISTS base_debit_amount;
ALTER TABLE general_ledger DROP COLUMN IF EXISTS exchange_rate;
ALTER TABLE general_ledger DROP COLUMN IF EXISTS currency_code;
ALTER TABLE general_ledger DROP COLUMN IF EXISTS reference;