-- +goose Up
-- Enhance warehouses table with additional fields

ALTER TABLE warehouses 
ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'main',
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS manager VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS zones JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{"open": "08:00", "close": "17:00"}',
ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT '{"lat": 0, "lng": 0}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);
CREATE INDEX IF NOT EXISTS idx_warehouses_type ON warehouses(type);
CREATE INDEX IF NOT EXISTS idx_warehouses_city ON warehouses(city);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON warehouses(status);

-- Add check constraints
ALTER TABLE warehouses 
ADD CONSTRAINT chk_warehouses_type 
CHECK (type IN ('main', 'satellite', 'transit', 'quarantine', 'distribution', 'retail'));

ALTER TABLE warehouses 
ADD CONSTRAINT chk_warehouses_status 
CHECK (status IN ('active', 'inactive', 'maintenance', 'planned'));

ALTER TABLE warehouses 
ADD CONSTRAINT chk_warehouses_capacity 
CHECK (capacity >= 0);

ALTER TABLE warehouses 
ADD CONSTRAINT chk_warehouses_stock 
CHECK (current_stock >= 0);

-- +goose Down
-- Remove enhancements
ALTER TABLE warehouses 
DROP COLUMN IF EXISTS code,
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS manager,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS capacity,
DROP COLUMN IF EXISTS current_stock,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS zones,
DROP COLUMN IF EXISTS operating_hours,
DROP COLUMN IF EXISTS facilities,
DROP COLUMN IF EXISTS coordinates;

DROP INDEX IF EXISTS idx_warehouses_code;
DROP INDEX IF EXISTS idx_warehouses_type;
DROP INDEX IF EXISTS idx_warehouses_city;
DROP INDEX IF EXISTS idx_warehouses_status;