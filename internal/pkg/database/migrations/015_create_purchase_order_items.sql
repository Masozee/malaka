-- +goose Up
CREATE TABLE purchase_order_items (
    id VARCHAR(255) PRIMARY KEY,
    purchase_order_id VARCHAR(255) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    article_id VARCHAR(255) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE purchase_order_items;
