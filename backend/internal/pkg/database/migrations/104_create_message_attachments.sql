-- +goose Up
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_key VARCHAR(1000) NOT NULL,
    file_category VARCHAR(20) NOT NULL DEFAULT 'document',
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_message_attachments_conversation_id ON message_attachments(conversation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_message_attachments_uploader_id ON message_attachments(uploader_id);

-- +goose Down
DROP TABLE IF EXISTS message_attachments;
