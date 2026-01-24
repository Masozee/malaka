-- +goose Up

-- Create Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, resource, action)
);

-- Add RBAC fields to Users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- Update Procurement Purchase Orders Status Check Constraint
ALTER TABLE procurement_purchase_orders DROP CONSTRAINT IF EXISTS procurement_purchase_orders_status_check;
ALTER TABLE procurement_purchase_orders ADD CONSTRAINT procurement_purchase_orders_status_check 
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'shipped', 'received', 'cancelled'));

-- Create default roles (Optional, but useful)
INSERT INTO roles (name, description, level) VALUES 
('Staff', 'Regular employee with basic access', 1),
('Supervisor', 'Supervisor with approval authority', 2),
('Manager', 'Manager with full approval authority', 3),
('Director', 'Director with ultimate authority', 4)
ON CONFLICT (name) DO NOTHING;

-- +goose Down
-- Revert Purchase Orders Status Check
ALTER TABLE procurement_purchase_orders DROP CONSTRAINT IF EXISTS procurement_purchase_orders_status_check;
ALTER TABLE procurement_purchase_orders ADD CONSTRAINT procurement_purchase_orders_status_check 
    CHECK (status IN ('draft', 'sent', 'confirmed', 'shipped', 'received', 'cancelled'));

-- Remove RBAC fields from Users
ALTER TABLE users DROP COLUMN IF EXISTS role_id;
ALTER TABLE users DROP COLUMN IF EXISTS department;

-- Drop Tables
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
