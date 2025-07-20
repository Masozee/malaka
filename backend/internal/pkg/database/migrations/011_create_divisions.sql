-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_divisions_code ON divisions(code);
CREATE INDEX idx_divisions_parent_id ON divisions(parent_id);
CREATE INDEX idx_divisions_level ON divisions(level);
CREATE INDEX idx_divisions_is_active ON divisions(is_active);

-- Sample data moved to seeds/divisions.sql
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS divisions;
-- +goose StatementEnd