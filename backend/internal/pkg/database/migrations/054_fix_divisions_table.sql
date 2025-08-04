-- +goose Up
-- Fix divisions table to match entity structure
ALTER TABLE divisions 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Drop is_active column if it exists (will be replaced by status)
ALTER TABLE divisions DROP COLUMN IF EXISTS is_active;

-- +goose Down
-- Restore original structure
ALTER TABLE divisions 
ADD COLUMN is_active BOOLEAN DEFAULT true,
DROP COLUMN sort_order,
DROP COLUMN status;

-- Update existing records
UPDATE divisions SET is_active = CASE WHEN status = 'active' THEN true ELSE false END;