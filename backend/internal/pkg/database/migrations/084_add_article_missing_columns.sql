-- +goose Up
-- +goose StatementBegin
-- Migration: Add missing columns to articles table
-- These columns are needed to match the frontend form fields

-- Add code column (unique article code)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS code VARCHAR(50);

-- Add brand column
ALTER TABLE articles ADD COLUMN IF NOT EXISTS brand VARCHAR(100);

-- Add category column
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add gender column
ALTER TABLE articles ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Add status column with default value
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_articles_code ON articles(code);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_articles_status;
DROP INDEX IF EXISTS idx_articles_code;
ALTER TABLE articles DROP COLUMN IF EXISTS status;
ALTER TABLE articles DROP COLUMN IF EXISTS gender;
ALTER TABLE articles DROP COLUMN IF EXISTS category;
ALTER TABLE articles DROP COLUMN IF EXISTS brand;
ALTER TABLE articles DROP COLUMN IF EXISTS code;
-- +goose StatementEnd
