-- +goose Up
CREATE TABLE IF NOT EXISTS draft_orders (
    id VARCHAR(255) PRIMARY KEY,
    supplier_id VARCHAR(255) NOT NULL,
    order_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE draft_orders;