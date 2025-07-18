-- +goose Up
CREATE TABLE goods_receipt_items (
    id VARCHAR(255) PRIMARY KEY,
    goods_receipt_id VARCHAR(255) NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    article_id VARCHAR(255) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE goods_receipt_items;
