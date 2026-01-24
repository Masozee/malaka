-- +goose Up

-- Procurement Purchase Orders table (separate from inventory purchase_orders)
CREATE TABLE IF NOT EXISTS procurement_purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    purchase_request_id UUID REFERENCES purchase_requests(id) ON DELETE SET NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    delivery_address TEXT NOT NULL,
    payment_terms VARCHAR(255) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    shipping_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'shipped', 'received', 'cancelled')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Procurement Purchase Order Items table
CREATE TABLE IF NOT EXISTS procurement_purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES procurement_purchase_orders(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    specification TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    line_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    received_quantity INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_proc_po_status ON procurement_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_proc_po_supplier ON procurement_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_proc_po_payment_status ON procurement_purchase_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_proc_po_order_date ON procurement_purchase_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_proc_po_created_at ON procurement_purchase_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proc_po_created_by ON procurement_purchase_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_proc_po_pr_id ON procurement_purchase_orders(purchase_request_id);

CREATE INDEX IF NOT EXISTS idx_proc_po_items_order ON procurement_purchase_order_items(purchase_order_id);

-- +goose Down

-- Drop indexes
DROP INDEX IF EXISTS idx_proc_po_status;
DROP INDEX IF EXISTS idx_proc_po_supplier;
DROP INDEX IF EXISTS idx_proc_po_payment_status;
DROP INDEX IF EXISTS idx_proc_po_order_date;
DROP INDEX IF EXISTS idx_proc_po_created_at;
DROP INDEX IF EXISTS idx_proc_po_created_by;
DROP INDEX IF EXISTS idx_proc_po_pr_id;
DROP INDEX IF EXISTS idx_proc_po_items_order;

-- Drop tables
DROP TABLE IF EXISTS procurement_purchase_order_items;
DROP TABLE IF EXISTS procurement_purchase_orders;
