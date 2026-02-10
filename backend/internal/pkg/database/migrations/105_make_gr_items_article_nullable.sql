-- +goose Up
-- +goose StatementBegin

-- Make article_id nullable in goods_receipt_items for procurement-generated GRs
-- Procurement PO items don't necessarily map to articles in master data
ALTER TABLE goods_receipt_items ALTER COLUMN article_id DROP NOT NULL;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Restore NOT NULL constraint
ALTER TABLE goods_receipt_items ALTER COLUMN article_id SET NOT NULL;

-- +goose StatementEnd
