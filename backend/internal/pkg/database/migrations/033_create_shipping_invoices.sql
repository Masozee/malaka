-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS shipping_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(255) NOT NULL UNIQUE,
    shipment_id UUID NOT NULL,
    courier_id UUID NOT NULL,
    invoice_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    base_rate DECIMAL(12,2) NOT NULL,
    additional_fees DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_shipping_invoices_shipment_id FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    CONSTRAINT fk_shipping_invoices_courier_id FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT chk_shipping_invoices_status CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
    CONSTRAINT chk_shipping_invoices_weight CHECK (weight > 0),
    CONSTRAINT chk_shipping_invoices_base_rate CHECK (base_rate > 0),
    CONSTRAINT chk_shipping_invoices_additional_fees CHECK (additional_fees >= 0),
    CONSTRAINT chk_shipping_invoices_tax_amount CHECK (tax_amount >= 0),
    CONSTRAINT chk_shipping_invoices_total_amount CHECK (total_amount > 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_shipping_invoices_shipment_id ON shipping_invoices(shipment_id);
CREATE INDEX idx_shipping_invoices_courier_id ON shipping_invoices(courier_id);
CREATE INDEX idx_shipping_invoices_status ON shipping_invoices(status);
CREATE INDEX idx_shipping_invoices_invoice_date ON shipping_invoices(invoice_date);
CREATE INDEX idx_shipping_invoices_due_date ON shipping_invoices(due_date);
CREATE INDEX idx_shipping_invoices_created_at ON shipping_invoices(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shipping_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_shipping_invoices_updated_at
    BEFORE UPDATE ON shipping_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_shipping_invoices_updated_at();


-- Create a view for invoice summaries
CREATE OR REPLACE VIEW shipping_invoice_summary AS
SELECT 
    si.id,
    si.invoice_number,
    si.invoice_date,
    si.due_date,
    si.origin,
    si.destination,
    si.total_amount,
    si.status,
    c.name as courier_name,
    s.tracking_number,
    CASE 
        WHEN si.status = 'PENDING' AND si.due_date < CURRENT_TIMESTAMP THEN 'OVERDUE'
        ELSE si.status
    END as current_status,
    CASE 
        WHEN si.due_date < CURRENT_TIMESTAMP AND si.status = 'PENDING' THEN 
            EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - si.due_date))
        ELSE 0
    END as days_overdue
FROM shipping_invoices si
JOIN couriers c ON si.courier_id = c.id
JOIN shipments s ON si.shipment_id = s.id
ORDER BY si.created_at DESC;

-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS shipping_invoices;