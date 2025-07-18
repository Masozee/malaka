-- +goose Up
CREATE TABLE transfer_items (
    id VARCHAR(255) PRIMARY KEY,
    transfer_order_id VARCHAR(255) NOT NULL REFERENCES transfer_orders(id) ON DELETE CASCADE,
    article_id VARCHAR(255) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE transfer_items;
