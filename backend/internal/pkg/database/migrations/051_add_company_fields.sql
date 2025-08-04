-- +goose Up
-- Add email, phone, and status fields to companies table
ALTER TABLE companies 
ADD COLUMN email VARCHAR(255),
ADD COLUMN phone VARCHAR(50),
ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- Add check constraint for status
ALTER TABLE companies 
ADD CONSTRAINT companies_status_check CHECK (status IN ('active', 'inactive'));

-- +goose Down
-- Remove added columns
ALTER TABLE companies 
DROP CONSTRAINT IF EXISTS companies_status_check,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS email;