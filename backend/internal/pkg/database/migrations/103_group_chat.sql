-- +goose Up
ALTER TABLE conversations ADD COLUMN is_group BOOLEAN DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN name VARCHAR(255);
ALTER TABLE conversations ADD COLUMN created_by UUID REFERENCES users(id);
ALTER TABLE conversation_participants ADD COLUMN role VARCHAR(20) DEFAULT 'member';

UPDATE conversations SET is_group = false WHERE is_group IS NULL;

-- +goose Down
ALTER TABLE conversation_participants DROP COLUMN IF EXISTS role;
ALTER TABLE conversations DROP COLUMN IF EXISTS created_by;
ALTER TABLE conversations DROP COLUMN IF EXISTS name;
ALTER TABLE conversations DROP COLUMN IF EXISTS is_group;
