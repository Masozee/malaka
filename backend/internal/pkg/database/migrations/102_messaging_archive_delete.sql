-- +goose Up
ALTER TABLE conversation_participants ADD COLUMN archived_at TIMESTAMPTZ DEFAULT NULL;

-- +goose Down
ALTER TABLE conversation_participants DROP COLUMN IF EXISTS archived_at;
