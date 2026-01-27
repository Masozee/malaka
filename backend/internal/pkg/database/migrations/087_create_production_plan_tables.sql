-- +goose Up
-- Production Plans main table
CREATE TABLE IF NOT EXISTS production_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_number VARCHAR(50) NOT NULL UNIQUE,
    plan_name VARCHAR(255) NOT NULL,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('weekly', 'monthly', 'quarterly', 'custom')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'completed', 'cancelled')),
    total_products INTEGER NOT NULL DEFAULT 0,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    total_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Production Plan Items table
CREATE TABLE IF NOT EXISTS production_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES production_plans(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    product_code VARCHAR(100) NOT NULL DEFAULT '',
    product_name VARCHAR(255) NOT NULL DEFAULT '',
    planned_quantity INTEGER NOT NULL DEFAULT 0,
    produced_quantity INTEGER NOT NULL DEFAULT 0,
    pending_quantity INTEGER NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_production_plans_plan_number ON production_plans(plan_number);
CREATE INDEX IF NOT EXISTS idx_production_plans_status ON production_plans(status);
CREATE INDEX IF NOT EXISTS idx_production_plans_plan_type ON production_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_production_plans_start_date ON production_plans(start_date);
CREATE INDEX IF NOT EXISTS idx_production_plans_end_date ON production_plans(end_date);
CREATE INDEX IF NOT EXISTS idx_production_plans_created_by ON production_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_production_plan_items_plan_id ON production_plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_production_plan_items_product_id ON production_plan_items(product_id);
CREATE INDEX IF NOT EXISTS idx_production_plan_items_status ON production_plan_items(status);
CREATE INDEX IF NOT EXISTS idx_production_plan_items_priority ON production_plan_items(priority);

-- +goose Down
DROP INDEX IF EXISTS idx_production_plan_items_priority;
DROP INDEX IF EXISTS idx_production_plan_items_status;
DROP INDEX IF EXISTS idx_production_plan_items_product_id;
DROP INDEX IF EXISTS idx_production_plan_items_plan_id;
DROP INDEX IF EXISTS idx_production_plans_created_by;
DROP INDEX IF EXISTS idx_production_plans_end_date;
DROP INDEX IF EXISTS idx_production_plans_start_date;
DROP INDEX IF EXISTS idx_production_plans_plan_type;
DROP INDEX IF EXISTS idx_production_plans_status;
DROP INDEX IF EXISTS idx_production_plans_plan_number;
DROP TABLE IF EXISTS production_plan_items;
DROP TABLE IF EXISTS production_plans;
