-- +goose Up
-- Migration 095: Seed role-permission mappings
-- Superadmin (level 99) bypasses all checks - no permission rows needed

-- Admin role: admin.*, masterdata.user.*, settings.*, invitations.*
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Admin'
  AND (p.module = 'admin' OR p.module = 'settings' OR p.module = 'invitations'
       OR (p.module = 'masterdata' AND p.resource = 'user'))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Finance Manager: finance.*, accounting.*
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Finance Manager'
  AND (p.module = 'finance' OR p.module = 'accounting')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Finance Staff: finance.*.create/read/list/update, accounting.*.read/list
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Finance Staff'
  AND ((p.module = 'finance' AND p.action IN ('create', 'read', 'list', 'update'))
    OR (p.module = 'accounting' AND p.action IN ('read', 'list')))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- HR Manager: hr.*
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'HR Manager' AND p.module = 'hr'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- HR Staff: hr.employee.read/list, hr.leave.create/read/list, hr.payroll.read/list, hr.training.read/list, hr.performance.read/list
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'HR Staff'
  AND p.module = 'hr'
  AND ((p.resource = 'employee' AND p.action IN ('read', 'list'))
    OR (p.resource = 'leave' AND p.action IN ('create', 'read', 'list'))
    OR (p.resource = 'payroll' AND p.action IN ('read', 'list'))
    OR (p.resource = 'training' AND p.action IN ('read', 'list'))
    OR (p.resource = 'performance' AND p.action IN ('read', 'list')))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Inventory Manager: inventory.*, masterdata.warehouse.*, masterdata.article.*
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Inventory Manager'
  AND (p.module = 'inventory'
    OR (p.module = 'masterdata' AND p.resource IN ('warehouse', 'article')))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Inventory Staff: inventory.*.create/read/list/update
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Inventory Staff'
  AND p.module = 'inventory'
  AND p.action IN ('create', 'read', 'list', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Sales Manager: sales.*, shipping.*, masterdata.customer.*
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Sales Manager'
  AND (p.module = 'sales' OR p.module = 'shipping'
    OR (p.module = 'masterdata' AND p.resource = 'customer'))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Sales Staff: sales.order/invoice/pos-transaction.create/read/list/update
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Sales Staff'
  AND p.module = 'sales'
  AND p.resource IN ('order', 'invoice', 'pos-transaction')
  AND p.action IN ('create', 'read', 'list', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Procurement Manager: procurement.*, masterdata.supplier.*
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Procurement Manager'
  AND (p.module = 'procurement'
    OR (p.module = 'masterdata' AND p.resource = 'supplier'))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Procurement Staff: procurement.purchase-request/rfq.create/read/list/update/submit
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Procurement Staff'
  AND p.module = 'procurement'
  AND p.resource IN ('purchase-request', 'rfq')
  AND p.action IN ('create', 'read', 'list', 'update', 'submit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Production Manager: production.*
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Production Manager' AND p.module = 'production'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Production Staff: production.work-order/quality-control.create/read/list/update
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Production Staff'
  AND p.module = 'production'
  AND p.resource IN ('work-order', 'quality-control')
  AND p.action IN ('create', 'read', 'list', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Viewer (and Staff): *.*.read, *.*.list across all modules
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('Viewer', 'Staff')
  AND p.action IN ('read', 'list')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Supervisor: Viewer permissions + approve actions in all modules
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Supervisor'
  AND (p.action IN ('read', 'list', 'approve'))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager: Full CRUD + approve across all modules (except admin.*)
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Manager'
  AND p.module != 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Director: Everything except admin.*
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Director'
  AND p.module != 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Grant all roles basic profile and notifications access
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name NOT IN ('Superadmin')
  AND r.is_active = TRUE
  AND ((p.module = 'profile') OR (p.module = 'notifications') OR (p.module = 'calendar' AND p.action IN ('read', 'list')))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- +goose Down
DELETE FROM role_permissions;
