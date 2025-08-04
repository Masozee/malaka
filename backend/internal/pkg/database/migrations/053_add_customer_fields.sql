-- +goose Up
ALTER TABLE customers 
ADD COLUMN contact_person VARCHAR(255),
ADD COLUMN email VARCHAR(255),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- Update existing customers with defaults
UPDATE customers 
SET 
    contact_person = name,
    email = LOWER(REPLACE(name, ' ', '.')) || '@example.com',
    phone = '021-' || LPAD((RANDOM() * 99999999)::INT::TEXT, 8, '0'),
    company_id = (SELECT id FROM companies LIMIT 1),
    status = 'active'
WHERE contact_person IS NULL;

-- +goose Down
ALTER TABLE customers 
DROP COLUMN contact_person,
DROP COLUMN email,
DROP COLUMN phone,
DROP COLUMN company_id,
DROP COLUMN status;