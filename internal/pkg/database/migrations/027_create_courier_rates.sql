-- +goose Up
CREATE TABLE IF NOT EXISTS courier_rates (
    id VARCHAR(255) PRIMARY KEY,
    courier_id VARCHAR(255) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE courier_rates;