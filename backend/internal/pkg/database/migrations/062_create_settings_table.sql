-- +goose Up
-- Settings Management System
-- This table provides a flexible, secure way to store all application settings

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- general, currency, tax, api, email, security, etc.
    sub_category VARCHAR(50), -- For nested categories like 'ramayana' under 'api'
    setting_key VARCHAR(100) NOT NULL, -- The actual setting name
    setting_value TEXT, -- The setting value (encrypted if sensitive)
    data_type VARCHAR(20) NOT NULL DEFAULT 'string', -- string, number, boolean, json, encrypted
    is_sensitive BOOLEAN DEFAULT FALSE, -- Whether this setting contains sensitive data
    is_public BOOLEAN DEFAULT FALSE, -- Whether this setting can be exposed to frontend
    default_value TEXT, -- Default value for the setting
    validation_rules JSON, -- Validation rules like min, max, pattern, options
    description TEXT, -- Human-readable description
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combinations
    UNIQUE(category, sub_category, setting_key)
);

-- Indexes for performance
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_public ON settings(is_public) WHERE is_public = true;
CREATE INDEX idx_settings_sensitive ON settings(is_sensitive) WHERE is_sensitive = true;
CREATE INDEX idx_settings_category_subcategory ON settings(category, sub_category);

-- Settings audit table for tracking changes
CREATE TABLE settings_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_id UUID NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES users(id),
    change_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX idx_settings_audit_setting_id ON settings_audit(setting_id);
CREATE INDEX idx_settings_audit_created_at ON settings_audit(created_at);

-- Settings permission table for role-based access
CREATE TABLE settings_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL, -- admin, manager, user, etc.
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50),
    can_read BOOLEAN DEFAULT FALSE,
    can_write BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for permission queries
CREATE INDEX idx_settings_permissions_role ON settings_permissions(role);
CREATE INDEX idx_settings_permissions_category ON settings_permissions(category, sub_category);

-- Triggers and functions removed to avoid goose parsing issues
-- They can be added manually later if needed

-- +goose Down
DROP TRIGGER IF EXISTS trigger_settings_audit ON settings;
DROP TRIGGER IF EXISTS trigger_settings_updated_at ON settings;
DROP FUNCTION IF EXISTS log_setting_change();
DROP FUNCTION IF EXISTS update_settings_updated_at();
DROP TABLE IF EXISTS settings_permissions;
DROP TABLE IF EXISTS settings_audit;
DROP TABLE IF EXISTS settings;