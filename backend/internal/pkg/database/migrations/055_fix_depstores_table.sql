-- +goose Up
-- Fix depstores table to match entity structure
ALTER TABLE depstores 
ADD COLUMN city VARCHAR(255),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN contact_person VARCHAR(255),
ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- Rename and update existing columns
ALTER TABLE depstores RENAME COLUMN contact TO temp_contact;
UPDATE depstores SET contact_person = temp_contact WHERE contact_person IS NULL;
ALTER TABLE depstores DROP COLUMN temp_contact;

-- Update payment_terms to string type
ALTER TABLE depstores ALTER COLUMN payment_terms TYPE VARCHAR(50);

-- Update existing records
UPDATE depstores SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END;

-- Drop old column
ALTER TABLE depstores DROP COLUMN is_active;

-- +goose Down
-- Restore original structure
ALTER TABLE depstores 
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN contact VARCHAR(255),
DROP COLUMN city,
DROP COLUMN phone,
DROP COLUMN contact_person,
DROP COLUMN commission_rate,
DROP COLUMN status;

-- Update existing records
UPDATE depstores SET is_active = CASE WHEN status = 'active' THEN true ELSE false END;
UPDATE depstores SET contact = contact_person WHERE contact IS NULL;

-- Restore payment_terms type
ALTER TABLE depstores ALTER COLUMN payment_terms TYPE INTEGER USING payment_terms::INTEGER;