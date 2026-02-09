-- +goose Up
-- Seed RBAC permissions for messaging module

INSERT INTO permissions (id, code, module, resource, action, description, created_at)
VALUES
    (gen_random_uuid(), 'messaging.key.read', 'messaging', 'key', 'read', 'View public keys', NOW()),
    (gen_random_uuid(), 'messaging.key.update', 'messaging', 'key', 'update', 'Upload/update public keys', NOW()),
    (gen_random_uuid(), 'messaging.conversation.list', 'messaging', 'conversation', 'list', 'List conversations', NOW()),
    (gen_random_uuid(), 'messaging.conversation.read', 'messaging', 'conversation', 'read', 'View a conversation', NOW()),
    (gen_random_uuid(), 'messaging.conversation.create', 'messaging', 'conversation', 'create', 'Create conversations', NOW()),
    (gen_random_uuid(), 'messaging.conversation.update', 'messaging', 'conversation', 'update', 'Update conversation state', NOW()),
    (gen_random_uuid(), 'messaging.message.list', 'messaging', 'message', 'list', 'List messages', NOW()),
    (gen_random_uuid(), 'messaging.message.create', 'messaging', 'message', 'create', 'Send messages', NOW())
ON CONFLICT (code) DO NOTHING;

-- Grant all messaging permissions to existing roles
INSERT INTO role_permissions (id, role_id, permission_id, granted_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE p.module = 'messaging'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- +goose Down
DELETE FROM role_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE module = 'messaging');
DELETE FROM permissions WHERE module = 'messaging';
