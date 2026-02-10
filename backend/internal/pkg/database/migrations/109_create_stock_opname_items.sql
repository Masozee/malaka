-- +goose Up
-- Add notes column to stock_opnames
ALTER TABLE stock_opnames ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create stock_opname_items table for individual article counts
CREATE TABLE IF NOT EXISTS stock_opname_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_opname_id UUID NOT NULL REFERENCES stock_opnames(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    system_qty INT NOT NULL DEFAULT 0,
    actual_qty INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_opname_items_opname_id ON stock_opname_items(stock_opname_id);

-- +goose Down
DROP TABLE IF EXISTS stock_opname_items;
ALTER TABLE stock_opnames DROP COLUMN IF EXISTS notes;
