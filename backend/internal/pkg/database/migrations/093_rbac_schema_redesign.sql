-- +goose Up
-- Migration 093: RBAC Schema Redesign
-- Adds many-to-many user-role and role-permission relationships

-- Step 1: Add new columns to roles table
ALTER TABLE roles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Step 2: Mark existing 4 roles as system roles
UPDATE roles SET is_system = TRUE WHERE name IN ('Staff', 'Supervisor', 'Manager', 'Director');

-- Step 3: Insert Superadmin role
INSERT INTO roles (id, name, description, level, is_system, is_active)
VALUES (gen_random_uuid(), 'Superadmin', 'System superadmin with full access', 99, TRUE, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Step 4: Insert additional functional roles
INSERT INTO roles (id, name, description, level, is_system, is_active) VALUES
    (gen_random_uuid(), 'Admin', 'System administrator', 10, TRUE, TRUE),
    (gen_random_uuid(), 'Finance Manager', 'Full access to finance and accounting', 8, TRUE, TRUE),
    (gen_random_uuid(), 'Finance Staff', 'Basic finance operations', 4, TRUE, TRUE),
    (gen_random_uuid(), 'HR Manager', 'Full access to HR module', 8, TRUE, TRUE),
    (gen_random_uuid(), 'HR Staff', 'Basic HR operations', 4, TRUE, TRUE),
    (gen_random_uuid(), 'Inventory Manager', 'Full access to inventory', 8, TRUE, TRUE),
    (gen_random_uuid(), 'Inventory Staff', 'Basic inventory operations', 4, TRUE, TRUE),
    (gen_random_uuid(), 'Sales Manager', 'Full access to sales and shipping', 8, TRUE, TRUE),
    (gen_random_uuid(), 'Sales Staff', 'Basic sales operations', 4, TRUE, TRUE),
    (gen_random_uuid(), 'Procurement Manager', 'Full access to procurement', 8, TRUE, TRUE),
    (gen_random_uuid(), 'Procurement Staff', 'Basic procurement operations', 4, TRUE, TRUE),
    (gen_random_uuid(), 'Production Manager', 'Full access to production', 8, TRUE, TRUE),
    (gen_random_uuid(), 'Production Staff', 'Basic production operations', 4, TRUE, TRUE),
    (gen_random_uuid(), 'Viewer', 'Read-only access across all modules', 1, TRUE, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Step 5: Create user_roles many-to-many table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- Step 6: Rename old permissions table to preserve data
ALTER TABLE IF EXISTS permissions RENAME TO permissions_legacy;

-- Step 7: Create new permissions table (master permission definitions)
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(200) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(module, resource, action)
);

CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);

-- Step 8: Create role_permissions many-to-many table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Step 9: Create RBAC audit log
CREATE TABLE IF NOT EXISTS rbac_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    target_permission_id UUID REFERENCES permissions(id) ON DELETE SET NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rbac_audit_log_actor ON rbac_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_log_target_user ON rbac_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_log_created_at ON rbac_audit_log(created_at);

-- Step 10: Migrate existing user->role assignments to user_roles table
-- Map users with role_id set
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, u.role_id
FROM users u
WHERE u.role_id IS NOT NULL
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Map users with role='admin' string to Superadmin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.role = 'admin' AND r.name = 'Superadmin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Map users with role='user' string to Staff role (catch-all)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.role = 'user' AND r.name = 'Staff'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Map users with role='manager' string to Manager role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.role = 'manager' AND r.name = 'Manager'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Map users with role='supervisor' string to Supervisor role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.role = 'supervisor' AND r.name = 'Supervisor'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Map users with role='director' string to Director role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.role = 'director' AND r.name = 'Director'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- +goose Down
DROP TABLE IF EXISTS rbac_audit_log;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
ALTER TABLE IF EXISTS permissions_legacy RENAME TO permissions;
DROP TABLE IF EXISTS user_roles;
ALTER TABLE roles DROP COLUMN IF EXISTS is_active;
ALTER TABLE roles DROP COLUMN IF EXISTS is_system;
ALTER TABLE roles DROP COLUMN IF EXISTS company_id;
DELETE FROM roles WHERE name IN ('Superadmin', 'Admin', 'Finance Manager', 'Finance Staff', 'HR Manager', 'HR Staff', 'Inventory Manager', 'Inventory Staff', 'Sales Manager', 'Sales Staff', 'Procurement Manager', 'Procurement Staff', 'Production Manager', 'Production Staff', 'Viewer');
