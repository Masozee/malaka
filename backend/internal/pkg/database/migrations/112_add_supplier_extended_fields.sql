-- +goose Up
ALTER TABLE suppliers
    ADD COLUMN IF NOT EXISTS code VARCHAR(50) DEFAULT '',
    ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255) DEFAULT '',
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '',
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT '',
    ADD COLUMN IF NOT EXISTS website VARCHAR(255) DEFAULT '',
    ADD COLUMN IF NOT EXISTS tax_id VARCHAR(100) DEFAULT '',
    ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100) DEFAULT '',
    ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(15,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Migrate existing contact data to contact_person
UPDATE suppliers SET contact_person = contact WHERE contact IS NOT NULL AND contact != '' AND (contact_person IS NULL OR contact_person = '');

-- +goose Down
ALTER TABLE suppliers
    DROP COLUMN IF EXISTS code,
    DROP COLUMN IF EXISTS contact_person,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS website,
    DROP COLUMN IF EXISTS tax_id,
    DROP COLUMN IF EXISTS payment_terms,
    DROP COLUMN IF EXISTS credit_limit,
    DROP COLUMN IF EXISTS status;
