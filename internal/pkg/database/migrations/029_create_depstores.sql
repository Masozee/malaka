-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS depstores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    contact VARCHAR(255) NOT NULL,
    payment_terms INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on code for fast lookups
CREATE INDEX idx_depstores_code ON depstores(code);
CREATE INDEX idx_depstores_is_active ON depstores(is_active);

-- Sample data moved to seeds/depstores.sql
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS depstores;
-- +goose StatementEnd