-- +goose Up
-- +goose StatementBegin

-- Add procurement_type and related fields to procurement_purchase_orders table
-- This enables proper accounting classification: COGS, OPEX, or Asset capitalization

-- Add procurement_type enum type if not exists
DO $$ BEGIN
    CREATE TYPE procurement_type AS ENUM ('RAW_MATERIAL', 'OFFICE_SUPPLY', 'ASSET', 'SERVICE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to procurement_purchase_orders
ALTER TABLE procurement_purchase_orders
ADD COLUMN IF NOT EXISTS procurement_type procurement_type DEFAULT 'RAW_MATERIAL',
ADD COLUMN IF NOT EXISTS expense_account_id UUID REFERENCES chart_of_accounts(id),
ADD COLUMN IF NOT EXISTS budget_commitment_id UUID;

-- Add comment explaining the purpose
COMMENT ON COLUMN procurement_purchase_orders.procurement_type IS 'Determines accounting treatment: RAW_MATERIAL=COGS, OFFICE_SUPPLY/SERVICE=OPEX, ASSET=Capitalize';
COMMENT ON COLUMN procurement_purchase_orders.expense_account_id IS 'Optional GL account override for expense booking';
COMMENT ON COLUMN procurement_purchase_orders.budget_commitment_id IS 'References budget commitment created at PO approval';

-- Create index for procurement_type filtering
CREATE INDEX IF NOT EXISTS idx_procurement_po_type ON procurement_purchase_orders(procurement_type);

-- Add budget_commitments table for tracking budget commitments
CREATE TABLE IF NOT EXISTS budget_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id),
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    amount DECIMAL(18,2) NOT NULL,
    reference_type VARCHAR(50) NOT NULL, -- PURCHASE_ORDER, PURCHASE_REQUEST
    reference_id UUID NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, RELEASED, REALIZED
    committed_by UUID NOT NULL REFERENCES users(id),
    committed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    released_at TIMESTAMP,
    released_by UUID REFERENCES users(id),
    release_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for budget commitment lookups
CREATE INDEX IF NOT EXISTS idx_budget_commitments_budget ON budget_commitments(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_commitments_reference ON budget_commitments(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_budget_commitments_status ON budget_commitments(status);

-- Add budget_realizations table for tracking budget realizations
CREATE TABLE IF NOT EXISTS budget_realizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID REFERENCES budget_commitments(id),
    budget_id UUID NOT NULL REFERENCES budgets(id),
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    amount DECIMAL(18,2) NOT NULL,
    reference_type VARCHAR(50) NOT NULL, -- GOODS_RECEIPT, AP_INVOICE
    reference_id UUID NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    realized_by UUID NOT NULL REFERENCES users(id),
    realized_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for budget realization lookups
CREATE INDEX IF NOT EXISTS idx_budget_realizations_budget ON budget_realizations(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_realizations_commitment ON budget_realizations(commitment_id);
CREATE INDEX IF NOT EXISTS idx_budget_realizations_reference ON budget_realizations(reference_type, reference_id);

-- NOTE: The inventory purchase_orders table (migration 018) should be deprecated
-- and all PO operations should use procurement_purchase_orders
-- Add a deprecation comment to the old table
COMMENT ON TABLE purchase_orders IS 'DEPRECATED: Use procurement_purchase_orders instead. This table is for legacy Inventory module compatibility only.';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Remove budget tables
DROP TABLE IF EXISTS budget_realizations;
DROP TABLE IF EXISTS budget_commitments;

-- Remove new columns from procurement_purchase_orders
ALTER TABLE procurement_purchase_orders
DROP COLUMN IF EXISTS budget_commitment_id,
DROP COLUMN IF EXISTS expense_account_id,
DROP COLUMN IF EXISTS procurement_type;

-- Remove enum type
DROP TYPE IF EXISTS procurement_type;

-- Remove deprecation comment
COMMENT ON TABLE purchase_orders IS NULL;

-- +goose StatementEnd
