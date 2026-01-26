-- +goose Up
-- Migration: Create notifications table for in-app notification system
-- Created: 2026-01-25

-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
    'order',
    'inventory',
    'payment',
    'production',
    'procurement',
    'hr',
    'system',
    'alert',
    'info'
);

-- Create notification status enum
CREATE TYPE notification_status AS ENUM (
    'unread',
    'read',
    'archived'
);

-- Create notification priority enum
CREATE TYPE notification_priority AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'info',
    priority notification_priority NOT NULL DEFAULT 'normal',
    status notification_status NOT NULL DEFAULT 'unread',
    action_url VARCHAR(500),
    reference_type VARCHAR(100),
    reference_id UUID,
    metadata JSONB DEFAULT '{}',
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE status = 'unread' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_reference ON notifications(reference_type, reference_id) WHERE reference_id IS NOT NULL;

-- Create notification preferences table (per-user settings)
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    order_notifications BOOLEAN DEFAULT TRUE,
    inventory_notifications BOOLEAN DEFAULT TRUE,
    payment_notifications BOOLEAN DEFAULT TRUE,
    production_notifications BOOLEAN DEFAULT TRUE,
    procurement_notifications BOOLEAN DEFAULT TRUE,
    hr_notifications BOOLEAN DEFAULT TRUE,
    system_notifications BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create index on notification preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'Stores in-app notifications for users';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery';
COMMENT ON COLUMN notifications.reference_type IS 'Type of entity this notification refers to (e.g., order, invoice)';
COMMENT ON COLUMN notifications.reference_id IS 'UUID of the related entity';
COMMENT ON COLUMN notifications.metadata IS 'Additional JSON data for notification context';
COMMENT ON COLUMN notifications.expires_at IS 'Optional expiry time for temporary notifications';

-- +goose Down
DROP TABLE IF EXISTS notification_preferences;
DROP TABLE IF EXISTS notifications;
DROP TYPE IF EXISTS notification_priority;
DROP TYPE IF EXISTS notification_status;
DROP TYPE IF EXISTS notification_type;
