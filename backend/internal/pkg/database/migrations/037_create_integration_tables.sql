-- +goose Up
-- Create integration module tables

-- Matahari MCP Integration
CREATE TABLE matahari_mcp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    store_code VARCHAR(20),
    pos_number VARCHAR(20),
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    card_number VARCHAR(50),
    approval_code VARCHAR(50),
    batch_number VARCHAR(50),
    terminal_id VARCHAR(50),
    merchant_id VARCHAR(50),
    response_code VARCHAR(10),
    response_message TEXT,
    sync_status VARCHAR(20) DEFAULT 'PENDING',
    synced_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ramayana Hierarchy Integration
CREATE TABLE ramayana_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hierarchy_code VARCHAR(50) UNIQUE NOT NULL,
    hierarchy_name VARCHAR(255) NOT NULL,
    hierarchy_level INTEGER NOT NULL,
    parent_code VARCHAR(50),
    region_code VARCHAR(20),
    area_code VARCHAR(20),
    store_code VARCHAR(20),
    department_code VARCHAR(20),
    category_code VARCHAR(20),
    subcategory_code VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    sync_status VARCHAR(20) DEFAULT 'PENDING',
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Star Rambla Integration
CREATE TABLE star_rambla (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100) UNIQUE NOT NULL,
    store_code VARCHAR(20),
    transaction_date DATE NOT NULL,
    customer_code VARCHAR(50),
    supplier_code VARCHAR(50),
    total_amount DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    payment_terms INTEGER DEFAULT 0,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING',
    sync_status VARCHAR(20) DEFAULT 'PENDING',
    synced_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Count Integration
CREATE TABLE stock_count (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    count_number VARCHAR(50) UNIQUE NOT NULL,
    store_code VARCHAR(20) NOT NULL,
    warehouse_code VARCHAR(20),
    count_date DATE NOT NULL,
    count_type VARCHAR(20) DEFAULT 'FULL',
    article_code VARCHAR(50) NOT NULL,
    barcode VARCHAR(50),
    size_code VARCHAR(20),
    color_code VARCHAR(20),
    system_qty INTEGER DEFAULT 0,
    physical_qty INTEGER NOT NULL,
    variance_qty INTEGER DEFAULT 0,
    unit_cost DECIMAL(12,2) DEFAULT 0,
    variance_value DECIMAL(15,2) DEFAULT 0,
    reason_code VARCHAR(20),
    remarks TEXT,
    counted_by VARCHAR(100),
    verified_by VARCHAR(100),
    sync_status VARCHAR(20) DEFAULT 'PENDING',
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Yogya Yobon Integration
CREATE TABLE yogya_yobon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100) UNIQUE NOT NULL,
    store_code VARCHAR(20) NOT NULL,
    pos_number VARCHAR(20),
    cashier_code VARCHAR(20),
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    customer_code VARCHAR(50),
    member_code VARCHAR(50),
    total_items INTEGER DEFAULT 0,
    total_qty INTEGER DEFAULT 0,
    subtotal DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_amount DECIMAL(15,2) DEFAULT 0,
    change_amount DECIMAL(15,2) DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    points_redeemed INTEGER DEFAULT 0,
    sync_status VARCHAR(20) DEFAULT 'PENDING',
    synced_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS yogya_yobon;
DROP TABLE IF EXISTS stock_count;
DROP TABLE IF EXISTS star_rambla;
DROP TABLE IF EXISTS ramayana_hierarchy;
DROP TABLE IF EXISTS matahari_mcp;