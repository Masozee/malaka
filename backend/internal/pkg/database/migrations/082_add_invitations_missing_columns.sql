-- +goose Up
-- Migration: Add missing columns to invitations table
-- This migration adds columns that may be missing if the table was created
-- before the full migration was in place

-- Add created_user_id column if it doesn't exist (PostgreSQL 9.6+)
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS created_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add metadata column if it doesn't exist
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create index on created_user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_invitations_created_user_id ON invitations(created_user_id);

-- +goose Down
-- Remove the added columns (only if they exist)
DROP INDEX IF EXISTS idx_invitations_created_user_id;
ALTER TABLE invitations DROP COLUMN IF EXISTS created_user_id;
ALTER TABLE invitations DROP COLUMN IF EXISTS metadata;
