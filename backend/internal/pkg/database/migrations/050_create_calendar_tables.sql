-- +goose Up
-- Migration: Create calendar and events tables
-- Created: 2024-07-28

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    event_type VARCHAR(50) NOT NULL DEFAULT 'event', -- 'event', 'meeting', 'task', 'reminder', 'holiday'
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
    is_all_day BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT, -- For future recurring events support
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT events_event_type_check CHECK (event_type IN ('event', 'meeting', 'task', 'reminder', 'holiday')),
    CONSTRAINT events_priority_check CHECK (priority IN ('low', 'medium', 'high')),
    CONSTRAINT events_datetime_check CHECK (end_datetime IS NULL OR end_datetime >= start_datetime)
);

-- Create event attendees table for meetings
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    response_message TEXT,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT event_attendees_status_check CHECK (status IN ('pending', 'accepted', 'declined')),
    CONSTRAINT event_attendees_unique UNIQUE(event_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_end_datetime ON events(end_datetime);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date_range ON events(start_datetime, end_datetime);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON event_attendees(status);

-- Insert default holiday events
INSERT INTO events (id, title, description, start_datetime, event_type, priority, is_all_day, created_by) VALUES
    ('00000000-0000-0000-0000-000000000001', 'New Year Day', 'Indonesian New Year holiday', '2024-01-01 00:00:00+07', 'holiday', 'high', true, '00000000-0000-0000-0000-000000000000'),
    ('00000000-0000-0000-0000-000000000002', 'Chinese New Year', 'Chinese New Year celebration', '2024-02-10 00:00:00+07', 'holiday', 'high', true, '00000000-0000-0000-0000-000000000000'),
    ('00000000-0000-0000-0000-000000000003', 'Nyepi Day', 'Balinese Day of Silence', '2024-03-11 00:00:00+07', 'holiday', 'high', true, '00000000-0000-0000-0000-000000000000'),
    ('00000000-0000-0000-0000-000000000004', 'Good Friday', 'Christian holiday', '2024-03-29 00:00:00+07', 'holiday', 'high', true, '00000000-0000-0000-0000-000000000000'),
    ('00000000-0000-0000-0000-000000000005', 'Eid al-Fitr', 'End of Ramadan celebration', '2024-04-10 00:00:00+07', 'holiday', 'high', true, '00000000-0000-0000-0000-000000000000'),
    ('00000000-0000-0000-0000-000000000006', 'Labor Day', 'International Workers Day', '2024-05-01 00:00:00+07', 'holiday', 'high', true, '00000000-0000-0000-0000-000000000000'),
    ('00000000-0000-0000-0000-000000000007', 'Ascension of Jesus Christ', 'Christian holiday', '2024-05-09 00:00:00+07', 'holiday', 'high', true, '00000000-0000-0000-0000-000000000000'),
    ('00000000-0000-0000-0000-000000000008', 'Buddha Day', 'Waisak Day celebration', '2024-05-23 00:00:00+07', 'holiday', 'high', true, '00000000-0000-0000-0000-000000000000'),
    ('00000000-0000-0000-0000-000000000009', 'Independence Day', 'Indonesian Independence Day', '2024-08-17 00:00:00+07', 'holiday', 'high', true, '00000000-0000-0000-0000-000000000000'),
    ('00000000-0000-0000-0000-000000000010', 'Eid al-Adha', 'Festival of Sacrifice', '2024-06-17 00:00:00+07', 'holiday', 'high', true, '00000000-0000-0000-0000-000000000000'),
    ('00000000-0000-0000-0000-000000000011', 'Islamic New Year', 'Hijri New Year', '2024-07-07 00:00:00+07', 'holiday', 'medium', true, '00000000-0000-0000-0000-000000000000'),
    ('00000000-0000-0000-0000-000000000012', 'Prophet Muhammad Birthday', 'Maulid Nabi celebration', '2024-09-16 00:00:00+07', 'holiday', 'medium', true, '00000000-0000-0000-0000-000000000000'),
    ('00000000-0000-0000-0000-000000000013', 'Christmas Day', 'Christian celebration', '2024-12-25 00:00:00+07', 'holiday', 'high', true, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- +goose Down
-- Drop tables in reverse order
DROP TABLE IF EXISTS event_attendees;
DROP TABLE IF EXISTS events;