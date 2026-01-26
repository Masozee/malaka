-- +goose Up
-- Migration: Create invitations table for user registration invitations
-- Created: 2026-01-26

-- Create invitation status enum
CREATE TYPE invitation_status AS ENUM (
    'pending',
    'accepted',
    'expired',
    'revoked'
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status invitation_status NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by ON invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_invitations_company_id ON invitations(company_id);

-- Add comments for documentation
COMMENT ON TABLE invitations IS 'Stores user registration invitations sent by administrators';
COMMENT ON COLUMN invitations.token IS 'Unique token used in the invitation URL';
COMMENT ON COLUMN invitations.role IS 'Role assigned to user upon registration';
COMMENT ON COLUMN invitations.invited_by IS 'User ID of the administrator who sent the invitation';
COMMENT ON COLUMN invitations.created_user_id IS 'User ID created when invitation is accepted';
COMMENT ON COLUMN invitations.metadata IS 'Additional data like custom message, department, etc.';

-- +goose Down
DROP TABLE IF EXISTS invitations;
DROP TYPE IF EXISTS invitation_status;
