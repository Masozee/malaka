-- +goose Up
CREATE TABLE stock_movements (
    id VARCHAR(255) PRIMARY KEY,
    article_id VARCHAR(255) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    warehouse_id VARCHAR(255) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reference_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE stock_movements;
