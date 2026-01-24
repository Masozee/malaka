-- +goose Up

-- Purchase Requests table
CREATE TABLE IF NOT EXISTS purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    department VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'cancelled')),
    requested_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    required_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Request Items table
CREATE TABLE IF NOT EXISTS purchase_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    specification TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
    estimated_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    contract_type VARCHAR(20) NOT NULL DEFAULT 'supply' CHECK (contract_type IN ('service', 'supply', 'framework', 'one-time')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'renewed')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    value NUMERIC(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    payment_terms VARCHAR(255),
    terms_conditions TEXT,
    auto_renewal BOOLEAN NOT NULL DEFAULT FALSE,
    renewal_period INTEGER, -- in months
    notice_period INTEGER, -- in days
    signed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    signed_date DATE,
    attachments JSONB, -- array of file paths
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Evaluations table
CREATE TABLE IF NOT EXISTS vendor_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    evaluation_period_start DATE NOT NULL,
    evaluation_period_end DATE NOT NULL,
    evaluator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'approved')),

    -- Scoring criteria (1-5 scale)
    quality_score INTEGER NOT NULL DEFAULT 3 CHECK (quality_score >= 1 AND quality_score <= 5),
    delivery_score INTEGER NOT NULL DEFAULT 3 CHECK (delivery_score >= 1 AND delivery_score <= 5),
    price_score INTEGER NOT NULL DEFAULT 3 CHECK (price_score >= 1 AND price_score <= 5),
    service_score INTEGER NOT NULL DEFAULT 3 CHECK (service_score >= 1 AND service_score <= 5),
    compliance_score INTEGER NOT NULL DEFAULT 3 CHECK (compliance_score >= 1 AND compliance_score <= 5),
    overall_score NUMERIC(3, 2) NOT NULL DEFAULT 3.00,

    -- Comments
    quality_comments TEXT,
    delivery_comments TEXT,
    price_comments TEXT,
    service_comments TEXT,
    compliance_comments TEXT,
    overall_comments TEXT,

    recommendation VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (recommendation IN ('preferred', 'approved', 'conditional', 'not_recommended')),
    action_items TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add procurement fields to purchase_orders table (enhancement)
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS po_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS purchase_request_id UUID REFERENCES purchase_requests(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
ADD COLUMN IF NOT EXISTS subtotal NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'IDR',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS received_at TIMESTAMP WITH TIME ZONE;

-- Update purchase_orders status to support new workflow
ALTER TABLE purchase_orders
DROP CONSTRAINT IF EXISTS purchase_orders_status_check;

ALTER TABLE purchase_orders
ADD CONSTRAINT purchase_orders_status_check
CHECK (status IN ('draft', 'pending', 'sent', 'confirmed', 'shipped', 'received', 'cancelled', 'approved', 'processing', 'completed'));

-- Add fields to purchase_order_items table
ALTER TABLE purchase_order_items
ADD COLUMN IF NOT EXISTS item_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS specification TEXT,
ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'pcs',
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_percentage NUMERIC(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS line_total NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS received_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'IDR';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_requester ON purchase_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_department ON purchase_requests(department);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_created_at ON purchase_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_request_items_pr ON purchase_request_items(purchase_request_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_items_supplier ON purchase_request_items(supplier_id);

CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_supplier ON contracts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON contracts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_expiring ON contracts(end_date) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_vendor_evaluations_status ON vendor_evaluations(status);
CREATE INDEX IF NOT EXISTS idx_vendor_evaluations_supplier ON vendor_evaluations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_vendor_evaluations_evaluator ON vendor_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_vendor_evaluations_period ON vendor_evaluations(evaluation_period_start, evaluation_period_end);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_pr_id ON purchase_orders(purchase_request_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_payment_status ON purchase_orders(payment_status);

-- +goose Down

-- Remove indexes
DROP INDEX IF EXISTS idx_purchase_requests_status;
DROP INDEX IF EXISTS idx_purchase_requests_requester;
DROP INDEX IF EXISTS idx_purchase_requests_department;
DROP INDEX IF EXISTS idx_purchase_requests_created_at;
DROP INDEX IF EXISTS idx_purchase_request_items_pr;
DROP INDEX IF EXISTS idx_purchase_request_items_supplier;
DROP INDEX IF EXISTS idx_contracts_status;
DROP INDEX IF EXISTS idx_contracts_supplier;
DROP INDEX IF EXISTS idx_contracts_dates;
DROP INDEX IF EXISTS idx_contracts_expiring;
DROP INDEX IF EXISTS idx_vendor_evaluations_status;
DROP INDEX IF EXISTS idx_vendor_evaluations_supplier;
DROP INDEX IF EXISTS idx_vendor_evaluations_evaluator;
DROP INDEX IF EXISTS idx_vendor_evaluations_period;
DROP INDEX IF EXISTS idx_purchase_orders_po_number;
DROP INDEX IF EXISTS idx_purchase_orders_pr_id;
DROP INDEX IF EXISTS idx_purchase_orders_payment_status;

-- Remove purchase_order_items added columns
ALTER TABLE purchase_order_items
DROP COLUMN IF EXISTS item_name,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS specification,
DROP COLUMN IF EXISTS unit,
DROP COLUMN IF EXISTS discount_percentage,
DROP COLUMN IF EXISTS tax_percentage,
DROP COLUMN IF EXISTS line_total,
DROP COLUMN IF EXISTS received_quantity,
DROP COLUMN IF EXISTS currency;

-- Remove purchase_orders added columns
ALTER TABLE purchase_orders
DROP COLUMN IF EXISTS po_number,
DROP COLUMN IF EXISTS purchase_request_id,
DROP COLUMN IF EXISTS expected_delivery_date,
DROP COLUMN IF EXISTS delivery_address,
DROP COLUMN IF EXISTS payment_terms,
DROP COLUMN IF EXISTS payment_status,
DROP COLUMN IF EXISTS subtotal,
DROP COLUMN IF EXISTS tax_amount,
DROP COLUMN IF EXISTS discount_amount,
DROP COLUMN IF EXISTS shipping_cost,
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS notes,
DROP COLUMN IF EXISTS sent_at,
DROP COLUMN IF EXISTS confirmed_at,
DROP COLUMN IF EXISTS received_at;

-- Drop tables in reverse order of creation (due to foreign keys)
DROP TABLE IF EXISTS vendor_evaluations;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS purchase_request_items;
DROP TABLE IF EXISTS purchase_requests;
