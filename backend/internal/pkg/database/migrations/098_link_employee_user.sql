-- +goose Up
ALTER TABLE employees ADD COLUMN user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX idx_employees_user_id ON employees(user_id);

-- +goose Down
DROP INDEX IF EXISTS idx_employees_user_id;
ALTER TABLE employees DROP COLUMN IF EXISTS user_id;
