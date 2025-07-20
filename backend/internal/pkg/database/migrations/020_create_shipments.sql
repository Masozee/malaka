-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(255) NOT NULL UNIQUE,
    order_id UUID,
    customer_id UUID,
    courier_id UUID NOT NULL,
    shipment_date TIMESTAMP NOT NULL,
    delivery_date TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    origin_address TEXT,
    destination_address TEXT,
    total_weight DECIMAL(10,2),
    total_volume DECIMAL(10,2),
    shipping_cost DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_shipments_customer_id FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    CONSTRAINT fk_shipments_courier_id FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE RESTRICT
);

-- Create indexes for better query performance
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_shipment_date ON shipments(shipment_date);
CREATE INDEX idx_shipments_courier_id ON shipments(courier_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shipments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_shipments_updated_at
    BEFORE UPDATE ON shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_shipments_updated_at();

-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS shipments;