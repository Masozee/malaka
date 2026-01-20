-- +goose Up
-- Create POS transactions table for direct sales
CREATE TABLE pos_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- cash, card, transfer, installment
    cashier_id UUID NOT NULL,
    sales_person VARCHAR(100),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    visit_type VARCHAR(50), -- showroom, home_visit, office_visit, exhibition
    location VARCHAR(255),
    subtotal DECIMAL(15,2),
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, partial, failed
    delivery_method VARCHAR(20), -- pickup, delivery, shipping
    delivery_status VARCHAR(20), -- pending, delivered, cancelled
    commission_rate DECIMAL(5,2) DEFAULT 0,
    commission_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for common queries
CREATE INDEX idx_pos_transactions_date ON pos_transactions(transaction_date DESC);
CREATE INDEX idx_pos_transactions_cashier ON pos_transactions(cashier_id);
CREATE INDEX idx_pos_transactions_status ON pos_transactions(payment_status);
CREATE INDEX idx_pos_transactions_created_at ON pos_transactions(created_at DESC);

-- Create POS items table for transaction line items
CREATE TABLE pos_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pos_transaction_id UUID NOT NULL REFERENCES pos_transactions(id) ON DELETE CASCADE,
    article_id UUID,
    product_code VARCHAR(50),
    product_name VARCHAR(255),
    size VARCHAR(20),
    color VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    line_total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for pos_items
CREATE INDEX idx_pos_items_transaction ON pos_items(pos_transaction_id);
CREATE INDEX idx_pos_items_product ON pos_items(product_code);

-- +goose Down
DROP INDEX IF EXISTS idx_pos_items_product;
DROP INDEX IF EXISTS idx_pos_items_transaction;
DROP TABLE IF EXISTS pos_items;

DROP INDEX IF EXISTS idx_pos_transactions_created_at;
DROP INDEX IF EXISTS idx_pos_transactions_status;
DROP INDEX IF EXISTS idx_pos_transactions_cashier;
DROP INDEX IF EXISTS idx_pos_transactions_date;
DROP TABLE IF EXISTS pos_transactions;