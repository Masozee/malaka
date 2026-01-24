-- +goose Up
-- Migration: Create Procurement RFQ Tables
-- This migration creates tables for Request for Quotation (RFQ) management in the procurement module

-- procurement_rfqs: Main RFQ table
CREATE TABLE IF NOT EXISTS procurement_rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    created_by UUID NOT NULL REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- procurement_rfq_items: Items requested in an RFQ
CREATE TABLE IF NOT EXISTS procurement_rfq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES procurement_rfqs(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    specification TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
    target_price DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- procurement_rfq_suppliers: Suppliers invited to respond to an RFQ
CREATE TABLE IF NOT EXISTS procurement_rfq_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES procurement_rfqs(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'invited',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rfq_id, supplier_id)
);

-- procurement_rfq_responses: Supplier responses to RFQs
CREATE TABLE IF NOT EXISTS procurement_rfq_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES procurement_rfqs(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    response_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(20, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    delivery_time INTEGER DEFAULT 0,
    validity_period INTEGER DEFAULT 30,
    terms_conditions TEXT,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rfq_id, supplier_id)
);

-- procurement_rfq_response_items: Detailed pricing for each item in a response
CREATE TABLE IF NOT EXISTS procurement_rfq_response_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_response_id UUID NOT NULL REFERENCES procurement_rfq_responses(id) ON DELETE CASCADE,
    rfq_item_id UUID NOT NULL REFERENCES procurement_rfq_items(id) ON DELETE CASCADE,
    unit_price DECIMAL(20, 2) NOT NULL DEFAULT 0,
    total_price DECIMAL(20, 2) NOT NULL DEFAULT 0,
    delivery_time INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rfq_response_id, rfq_item_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_procurement_rfqs_status ON procurement_rfqs(status);
CREATE INDEX IF NOT EXISTS idx_procurement_rfqs_priority ON procurement_rfqs(priority);
CREATE INDEX IF NOT EXISTS idx_procurement_rfqs_created_by ON procurement_rfqs(created_by);
CREATE INDEX IF NOT EXISTS idx_procurement_rfqs_due_date ON procurement_rfqs(due_date);
CREATE INDEX IF NOT EXISTS idx_procurement_rfqs_deleted_at ON procurement_rfqs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_procurement_rfqs_rfq_number ON procurement_rfqs(rfq_number);

CREATE INDEX IF NOT EXISTS idx_procurement_rfq_items_rfq_id ON procurement_rfq_items(rfq_id);

CREATE INDEX IF NOT EXISTS idx_procurement_rfq_suppliers_rfq_id ON procurement_rfq_suppliers(rfq_id);
CREATE INDEX IF NOT EXISTS idx_procurement_rfq_suppliers_supplier_id ON procurement_rfq_suppliers(supplier_id);
CREATE INDEX IF NOT EXISTS idx_procurement_rfq_suppliers_status ON procurement_rfq_suppliers(status);

CREATE INDEX IF NOT EXISTS idx_procurement_rfq_responses_rfq_id ON procurement_rfq_responses(rfq_id);
CREATE INDEX IF NOT EXISTS idx_procurement_rfq_responses_supplier_id ON procurement_rfq_responses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_procurement_rfq_responses_status ON procurement_rfq_responses(status);

CREATE INDEX IF NOT EXISTS idx_procurement_rfq_response_items_response_id ON procurement_rfq_response_items(rfq_response_id);
CREATE INDEX IF NOT EXISTS idx_procurement_rfq_response_items_item_id ON procurement_rfq_response_items(rfq_item_id);

-- +goose Down
DROP TABLE IF EXISTS procurement_rfq_response_items;
DROP TABLE IF EXISTS procurement_rfq_responses;
DROP TABLE IF EXISTS procurement_rfq_suppliers;
DROP TABLE IF EXISTS procurement_rfq_items;
DROP TABLE IF EXISTS procurement_rfqs;
