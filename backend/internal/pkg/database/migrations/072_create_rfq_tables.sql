-- +goose Up
-- Request for Quotation (RFQ) tables
CREATE TABLE rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, published, closed, cancelled
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    created_by UUID NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RFQ Items - what we're requesting quotes for
CREATE TABLE rfq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    specification TEXT,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
    target_price DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RFQ Suppliers - who we're sending the RFQ to
CREATE TABLE rfq_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'invited', -- invited, responded, declined
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rfq_id, supplier_id)
);

-- RFQ Responses - supplier quotes
CREATE TABLE rfq_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    response_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    delivery_time INTEGER, -- days
    validity_period INTEGER, -- days
    terms_conditions TEXT,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted', -- submitted, under_review, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rfq_id, supplier_id)
);

-- RFQ Response Items - detailed quotes for each item
CREATE TABLE rfq_response_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_response_id UUID NOT NULL REFERENCES rfq_responses(id) ON DELETE CASCADE,
    rfq_item_id UUID NOT NULL REFERENCES rfq_items(id) ON DELETE CASCADE,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    delivery_time INTEGER, -- days for this specific item
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rfq_response_id, rfq_item_id)
);

-- Indexes for better performance
CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_rfqs_created_by ON rfqs(created_by);
CREATE INDEX idx_rfqs_due_date ON rfqs(due_date);
CREATE INDEX idx_rfqs_created_at ON rfqs(created_at);

CREATE INDEX idx_rfq_items_rfq_id ON rfq_items(rfq_id);

CREATE INDEX idx_rfq_suppliers_rfq_id ON rfq_suppliers(rfq_id);
CREATE INDEX idx_rfq_suppliers_supplier_id ON rfq_suppliers(supplier_id);
CREATE INDEX idx_rfq_suppliers_status ON rfq_suppliers(status);

CREATE INDEX idx_rfq_responses_rfq_id ON rfq_responses(rfq_id);
CREATE INDEX idx_rfq_responses_supplier_id ON rfq_responses(supplier_id);
CREATE INDEX idx_rfq_responses_status ON rfq_responses(status);
CREATE INDEX idx_rfq_responses_response_date ON rfq_responses(response_date);

CREATE INDEX idx_rfq_response_items_response_id ON rfq_response_items(rfq_response_id);
CREATE INDEX idx_rfq_response_items_item_id ON rfq_response_items(rfq_item_id);

-- +goose Down
DROP INDEX IF EXISTS idx_rfq_response_items_item_id;
DROP INDEX IF EXISTS idx_rfq_response_items_response_id;
DROP INDEX IF EXISTS idx_rfq_responses_response_date;
DROP INDEX IF EXISTS idx_rfq_responses_status;
DROP INDEX IF EXISTS idx_rfq_responses_supplier_id;
DROP INDEX IF EXISTS idx_rfq_responses_rfq_id;
DROP INDEX IF EXISTS idx_rfq_suppliers_status;
DROP INDEX IF EXISTS idx_rfq_suppliers_supplier_id;
DROP INDEX IF EXISTS idx_rfq_suppliers_rfq_id;
DROP INDEX IF EXISTS idx_rfq_items_rfq_id;
DROP INDEX IF EXISTS idx_rfqs_created_at;
DROP INDEX IF EXISTS idx_rfqs_due_date;
DROP INDEX IF EXISTS idx_rfqs_created_by;
DROP INDEX IF EXISTS idx_rfqs_status;

DROP TABLE IF EXISTS rfq_response_items;
DROP TABLE IF EXISTS rfq_responses;
DROP TABLE IF EXISTS rfq_suppliers;
DROP TABLE IF EXISTS rfq_items;
DROP TABLE IF EXISTS rfqs;