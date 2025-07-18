-- +goose Up
CREATE TABLE stock_balances (
    id VARCHAR(255) PRIMARY KEY,
    article_id VARCHAR(255) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    warehouse_id VARCHAR(255) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (article_id, warehouse_id)
);

-- +goose Down
DROP TABLE stock_balances;
