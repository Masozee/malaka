-- +goose Up
ALTER TABLE users 
ADD COLUMN full_name VARCHAR(255),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN role VARCHAR(50) DEFAULT 'user',
ADD COLUMN status VARCHAR(20) DEFAULT 'active',
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;

-- Update existing users with sensible defaults
UPDATE users 
SET 
    full_name = username,
    role = 'user',
    status = 'active'
WHERE full_name IS NULL;

-- +goose Down
ALTER TABLE users 
DROP COLUMN full_name,
DROP COLUMN phone,
DROP COLUMN role,
DROP COLUMN status,
DROP COLUMN last_login;