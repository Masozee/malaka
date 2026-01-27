-- +goose Up
-- +goose StatementBegin

-- Fixed Assets table
CREATE TABLE IF NOT EXISTS fixed_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code VARCHAR(50) NOT NULL UNIQUE,
    asset_name VARCHAR(255) NOT NULL,
    asset_category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    purchase_date DATE NOT NULL,
    purchase_price DECIMAL(18, 2) NOT NULL,
    salvage_value DECIMAL(18, 2) NOT NULL DEFAULT 0,
    useful_life INT NOT NULL,
    depreciation_method VARCHAR(50) NOT NULL DEFAULT 'STRAIGHT_LINE',
    accumulated_depreciation DECIMAL(18, 2) NOT NULL DEFAULT 0,
    book_value DECIMAL(18, 2) NOT NULL,
    last_depreciation_date DATE,
    location_id VARCHAR(255),
    department_id VARCHAR(255),
    responsible_person_id VARCHAR(255),
    vendor VARCHAR(255),
    serial_number VARCHAR(255),
    model_number VARCHAR(255),
    warranty_expiry DATE,
    insurance_value DECIMAL(18, 2) DEFAULT 0,
    insurance_expiry DATE,
    maintenance_schedule VARCHAR(255),
    notes TEXT,
    company_id VARCHAR(100) NOT NULL DEFAULT 'default',
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fixed Asset Depreciations table
CREATE TABLE IF NOT EXISTS fixed_asset_depreciations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixed_asset_id UUID NOT NULL REFERENCES fixed_assets(id) ON DELETE CASCADE,
    depreciation_date DATE NOT NULL,
    depreciation_amount DECIMAL(18, 2) NOT NULL,
    accumulated_depreciation DECIMAL(18, 2) NOT NULL,
    book_value DECIMAL(18, 2) NOT NULL,
    period VARCHAR(20) NOT NULL,
    journal_entry_id UUID,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fixed Asset Disposals table
CREATE TABLE IF NOT EXISTS fixed_asset_disposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixed_asset_id UUID NOT NULL REFERENCES fixed_assets(id) ON DELETE CASCADE,
    disposal_date DATE NOT NULL,
    disposal_method VARCHAR(50) NOT NULL,
    disposal_price DECIMAL(18, 2) NOT NULL DEFAULT 0,
    book_value_at_disposal DECIMAL(18, 2) NOT NULL,
    gain_loss DECIMAL(18, 2) NOT NULL DEFAULT 0,
    reason TEXT,
    authorized_by VARCHAR(255),
    journal_entry_id UUID,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fixed_assets_company_id ON fixed_assets(company_id);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_status ON fixed_assets(status);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_category ON fixed_assets(asset_category);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_location ON fixed_assets(location_id);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_department ON fixed_assets(department_id);
CREATE INDEX IF NOT EXISTS idx_fixed_asset_depreciations_asset_id ON fixed_asset_depreciations(fixed_asset_id);
CREATE INDEX IF NOT EXISTS idx_fixed_asset_depreciations_period ON fixed_asset_depreciations(period);
CREATE INDEX IF NOT EXISTS idx_fixed_asset_disposals_asset_id ON fixed_asset_disposals(fixed_asset_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS fixed_asset_disposals;
DROP TABLE IF EXISTS fixed_asset_depreciations;
DROP TABLE IF EXISTS fixed_assets;
-- +goose StatementEnd
