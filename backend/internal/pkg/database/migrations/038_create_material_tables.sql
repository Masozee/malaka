-- +goose Up
-- Create material module tables

-- Materials
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_code VARCHAR(50) UNIQUE NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit_of_measure VARCHAR(20) NOT NULL,
    standard_cost DECIMAL(12,2) DEFAULT 0,
    current_cost DECIMAL(12,2) DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    supplier_id UUID,
    lead_time_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Warehouses
CREATE TABLE material_warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_code VARCHAR(50) UNIQUE NOT NULL,
    warehouse_name VARCHAR(255) NOT NULL,
    warehouse_type VARCHAR(50) DEFAULT 'MATERIAL',
    location VARCHAR(255),
    manager_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Purchase Orders
CREATE TABLE material_purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES material_warehouses(id),
    order_date DATE NOT NULL,
    expected_date DATE,
    total_amount DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    payment_terms INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'PENDING',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Purchase Order Items
CREATE TABLE material_purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES material_purchase_orders(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Receipts
CREATE TABLE material_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    po_id UUID REFERENCES material_purchase_orders(id),
    supplier_id UUID NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES material_warehouses(id),
    receipt_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    received_by UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Receipt Items
CREATE TABLE material_receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID NOT NULL REFERENCES material_receipts(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(12,2) NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL,
    batch_number VARCHAR(50),
    expiry_date DATE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Sales
CREATE TABLE material_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID,
    warehouse_id UUID NOT NULL REFERENCES material_warehouses(id),
    sale_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'PENDING',
    sold_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Sale Items
CREATE TABLE material_sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES material_sales(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Stock Adjustments
CREATE TABLE material_stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES material_warehouses(id),
    adjustment_date DATE NOT NULL,
    adjustment_type VARCHAR(20) NOT NULL,
    reason VARCHAR(255),
    total_value DECIMAL(15,2) DEFAULT 0,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Stock Adjustment Items
CREATE TABLE material_stock_adjustment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_id UUID NOT NULL REFERENCES material_stock_adjustments(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    current_quantity INTEGER NOT NULL,
    adjusted_quantity INTEGER NOT NULL,
    variance_quantity INTEGER NOT NULL,
    unit_cost DECIMAL(12,2) NOT NULL,
    variance_value DECIMAL(15,2) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Stock Transfers
CREATE TABLE material_stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    from_warehouse_id UUID NOT NULL REFERENCES material_warehouses(id),
    to_warehouse_id UUID NOT NULL REFERENCES material_warehouses(id),
    transfer_date DATE NOT NULL,
    total_value DECIMAL(15,2) DEFAULT 0,
    requested_by UUID NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'PENDING',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Stock Transfer Items
CREATE TABLE material_stock_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES material_stock_transfers(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(12,2) NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advance Debt (Material)
CREATE TABLE advance_debt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL,
    advance_amount DECIMAL(15,2) NOT NULL,
    used_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) NOT NULL,
    advance_date DATE NOT NULL,
    due_date DATE,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Closing
CREATE TABLE material_closing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES material_warehouses(id),
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    closing_date DATE NOT NULL,
    total_materials INTEGER DEFAULT 0,
    total_value DECIMAL(15,2) DEFAULT 0,
    total_purchases DECIMAL(15,2) DEFAULT 0,
    total_sales DECIMAL(15,2) DEFAULT 0,
    total_adjustments DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'OPEN',
    closed_by UUID,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(warehouse_id, period_year, period_month)
);

-- +goose Down
DROP TABLE IF EXISTS material_closing;
DROP TABLE IF EXISTS advance_debt;
DROP TABLE IF EXISTS material_stock_transfer_items;
DROP TABLE IF EXISTS material_stock_transfers;
DROP TABLE IF EXISTS material_stock_adjustment_items;
DROP TABLE IF EXISTS material_stock_adjustments;
DROP TABLE IF EXISTS material_sale_items;
DROP TABLE IF EXISTS material_sales;
DROP TABLE IF EXISTS material_receipt_items;
DROP TABLE IF EXISTS material_receipts;
DROP TABLE IF EXISTS material_purchase_order_items;
DROP TABLE IF EXISTS material_purchase_orders;
DROP TABLE IF EXISTS material_warehouses;
DROP TABLE IF EXISTS materials;