-- +goose Up
-- +goose StatementBegin

-- Add status tracking and posting fields to goods_receipts
ALTER TABLE goods_receipts
ADD COLUMN IF NOT EXISTS gr_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS supplier_id UUID,
ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'IDR',
ADD COLUMN IF NOT EXISTS procurement_type VARCHAR(50) DEFAULT 'RAW_MATERIAL',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS received_by UUID,
ADD COLUMN IF NOT EXISTS posted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS posted_by UUID,
ADD COLUMN IF NOT EXISTS ap_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ap_id UUID,
ADD COLUMN IF NOT EXISTS journal_entry_id UUID;

-- Add comments for documentation
COMMENT ON COLUMN goods_receipts.gr_number IS 'Unique GR number like GR-20260127-0001';
COMMENT ON COLUMN goods_receipts.status IS 'DRAFT, POSTED, CANCELLED';
COMMENT ON COLUMN goods_receipts.procurement_type IS 'RAW_MATERIAL, OFFICE_SUPPLY, ASSET, SERVICE - determines accounting treatment';
COMMENT ON COLUMN goods_receipts.ap_created IS 'Whether AP record was created';
COMMENT ON COLUMN goods_receipts.ap_id IS 'FK to accounts_payable if created';
COMMENT ON COLUMN goods_receipts.journal_entry_id IS 'FK to journal_entries created on posting';

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_goods_receipts_gr_number ON goods_receipts(gr_number);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_status ON goods_receipts(status);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_supplier_id ON goods_receipts(supplier_id);

-- Add unit_price and line_total to goods_receipt_items if missing
ALTER TABLE goods_receipt_items
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS line_total DECIMAL(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS item_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'PCS',
ADD COLUMN IF NOT EXISTS po_item_id UUID;

-- Create sequence for GR number generation
CREATE SEQUENCE IF NOT EXISTS goods_receipt_number_seq START 1;

-- Function to generate GR number
CREATE OR REPLACE FUNCTION generate_gr_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_number VARCHAR(50);
    current_date_str VARCHAR(8);
    seq_num INT;
BEGIN
    current_date_str := TO_CHAR(NOW(), 'YYYYMMDD');
    seq_num := nextval('goods_receipt_number_seq');
    new_number := 'GR-' || current_date_str || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Remove function and sequence
DROP FUNCTION IF EXISTS generate_gr_number();
DROP SEQUENCE IF EXISTS goods_receipt_number_seq;

-- Remove new columns from goods_receipt_items
ALTER TABLE goods_receipt_items
DROP COLUMN IF EXISTS po_item_id,
DROP COLUMN IF EXISTS unit,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS item_name,
DROP COLUMN IF EXISTS line_total,
DROP COLUMN IF EXISTS unit_price;

-- Remove indexes
DROP INDEX IF EXISTS idx_goods_receipts_supplier_id;
DROP INDEX IF EXISTS idx_goods_receipts_status;
DROP INDEX IF EXISTS idx_goods_receipts_gr_number;

-- Remove new columns from goods_receipts
ALTER TABLE goods_receipts
DROP COLUMN IF EXISTS journal_entry_id,
DROP COLUMN IF EXISTS ap_id,
DROP COLUMN IF EXISTS ap_created,
DROP COLUMN IF EXISTS posted_by,
DROP COLUMN IF EXISTS posted_at,
DROP COLUMN IF EXISTS received_by,
DROP COLUMN IF EXISTS notes,
DROP COLUMN IF EXISTS procurement_type,
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS total_amount,
DROP COLUMN IF EXISTS supplier_name,
DROP COLUMN IF EXISTS supplier_id,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS gr_number;

-- +goose StatementEnd
