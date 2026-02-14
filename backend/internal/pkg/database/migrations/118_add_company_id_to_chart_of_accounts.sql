-- +goose Up
-- Add company_id to chart_of_accounts for multi-tenancy support

ALTER TABLE chart_of_accounts ADD COLUMN company_id VARCHAR(255) NOT NULL DEFAULT 'default';

-- Drop old unique constraint on account_code (global) and add per-company unique
ALTER TABLE chart_of_accounts DROP CONSTRAINT IF EXISTS chart_of_accounts_account_code_key;
ALTER TABLE chart_of_accounts ADD CONSTRAINT chart_of_accounts_company_account_code_key UNIQUE (company_id, account_code);

-- Index for company_id queries
CREATE INDEX idx_chart_of_accounts_company_id ON chart_of_accounts(company_id);

-- +goose Down
DROP INDEX IF EXISTS idx_chart_of_accounts_company_id;
ALTER TABLE chart_of_accounts DROP CONSTRAINT IF EXISTS chart_of_accounts_company_account_code_key;
ALTER TABLE chart_of_accounts ADD CONSTRAINT chart_of_accounts_account_code_key UNIQUE (account_code);
ALTER TABLE chart_of_accounts DROP COLUMN IF EXISTS company_id;
