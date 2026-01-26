-- +goose Up
-- Add missing fields to sizes table
ALTER TABLE sizes ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE sizes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE sizes ADD COLUMN IF NOT EXISTS size_category VARCHAR(50) DEFAULT 'shoe';
ALTER TABLE sizes ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE sizes ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Add missing fields to classifications table
ALTER TABLE classifications ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE classifications ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE classifications ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES classifications(id);
ALTER TABLE classifications ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sizes_status ON sizes(status);
CREATE INDEX IF NOT EXISTS idx_sizes_size_category ON sizes(size_category);
CREATE INDEX IF NOT EXISTS idx_classifications_status ON classifications(status);
CREATE INDEX IF NOT EXISTS idx_classifications_parent_id ON classifications(parent_id);

-- +goose Down
-- Remove indexes
DROP INDEX IF EXISTS idx_sizes_status;
DROP INDEX IF EXISTS idx_sizes_size_category;
DROP INDEX IF EXISTS idx_classifications_status;
DROP INDEX IF EXISTS idx_classifications_parent_id;

-- Remove columns from sizes
ALTER TABLE sizes DROP COLUMN IF EXISTS code;
ALTER TABLE sizes DROP COLUMN IF EXISTS description;
ALTER TABLE sizes DROP COLUMN IF EXISTS size_category;
ALTER TABLE sizes DROP COLUMN IF EXISTS sort_order;
ALTER TABLE sizes DROP COLUMN IF EXISTS status;

-- Remove columns from classifications
ALTER TABLE classifications DROP COLUMN IF EXISTS code;
ALTER TABLE classifications DROP COLUMN IF EXISTS description;
ALTER TABLE classifications DROP COLUMN IF EXISTS parent_id;
ALTER TABLE classifications DROP COLUMN IF EXISTS status;
