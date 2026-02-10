-- +goose Up
-- Add status and notes columns to return_suppliers
ALTER TABLE return_suppliers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE return_suppliers ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create return_supplier_items table
CREATE TABLE IF NOT EXISTS return_supplier_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_supplier_id UUID NOT NULL REFERENCES return_suppliers(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_return_supplier_items_return_id ON return_supplier_items(return_supplier_id);

-- +goose Down
DROP TABLE IF EXISTS return_supplier_items;
ALTER TABLE return_suppliers DROP COLUMN IF EXISTS notes;
ALTER TABLE return_suppliers DROP COLUMN IF EXISTS status;
