-- +goose Up
-- Migration 113: Seed tax module permissions and role mappings
-- Convention: module.resource.action

-- ===================== TAX MODULE PERMISSIONS =====================
INSERT INTO permissions (id, code, module, resource, action, description) VALUES
-- Output Tax (VAT Out / PPN Keluaran)
(gen_random_uuid(), 'tax.output-tax.create', 'tax', 'output-tax', 'create', 'Create output tax invoice'),
(gen_random_uuid(), 'tax.output-tax.read', 'tax', 'output-tax', 'read', 'View output tax invoice'),
(gen_random_uuid(), 'tax.output-tax.list', 'tax', 'output-tax', 'list', 'List output tax invoices'),
(gen_random_uuid(), 'tax.output-tax.update', 'tax', 'output-tax', 'update', 'Update output tax invoice'),
(gen_random_uuid(), 'tax.output-tax.delete', 'tax', 'output-tax', 'delete', 'Delete output tax invoice'),
(gen_random_uuid(), 'tax.output-tax.void', 'tax', 'output-tax', 'void', 'Void output tax invoice'),

-- Input Tax (VAT In / PPN Masukan)
(gen_random_uuid(), 'tax.input-tax.create', 'tax', 'input-tax', 'create', 'Create input tax invoice'),
(gen_random_uuid(), 'tax.input-tax.read', 'tax', 'input-tax', 'read', 'View input tax invoice'),
(gen_random_uuid(), 'tax.input-tax.list', 'tax', 'input-tax', 'list', 'List input tax invoices'),
(gen_random_uuid(), 'tax.input-tax.update', 'tax', 'input-tax', 'update', 'Update input tax invoice'),
(gen_random_uuid(), 'tax.input-tax.delete', 'tax', 'input-tax', 'delete', 'Delete input tax invoice'),
(gen_random_uuid(), 'tax.input-tax.claim', 'tax', 'input-tax', 'claim', 'Claim input tax credit'),

-- Withholding Tax (PPh 21/23/26)
(gen_random_uuid(), 'tax.withholding-tax.create', 'tax', 'withholding-tax', 'create', 'Create withholding tax slip'),
(gen_random_uuid(), 'tax.withholding-tax.read', 'tax', 'withholding-tax', 'read', 'View withholding tax slip'),
(gen_random_uuid(), 'tax.withholding-tax.list', 'tax', 'withholding-tax', 'list', 'List withholding tax slips'),
(gen_random_uuid(), 'tax.withholding-tax.update', 'tax', 'withholding-tax', 'update', 'Update withholding tax slip'),
(gen_random_uuid(), 'tax.withholding-tax.delete', 'tax', 'withholding-tax', 'delete', 'Delete withholding tax slip'),

-- Tax Reporting & Filing
(gen_random_uuid(), 'tax.reporting.create', 'tax', 'reporting', 'create', 'Create tax report'),
(gen_random_uuid(), 'tax.reporting.read', 'tax', 'reporting', 'read', 'View tax report'),
(gen_random_uuid(), 'tax.reporting.list', 'tax', 'reporting', 'list', 'List tax reports'),
(gen_random_uuid(), 'tax.reporting.update', 'tax', 'reporting', 'update', 'Update tax report'),
(gen_random_uuid(), 'tax.reporting.delete', 'tax', 'reporting', 'delete', 'Delete tax report'),
(gen_random_uuid(), 'tax.reporting.submit', 'tax', 'reporting', 'submit', 'Submit tax filing'),
(gen_random_uuid(), 'tax.reporting.approve', 'tax', 'reporting', 'approve', 'Approve tax filing'),

-- Tax Reconciliation
(gen_random_uuid(), 'tax.reconciliation.create', 'tax', 'reconciliation', 'create', 'Create tax reconciliation'),
(gen_random_uuid(), 'tax.reconciliation.read', 'tax', 'reconciliation', 'read', 'View tax reconciliation'),
(gen_random_uuid(), 'tax.reconciliation.list', 'tax', 'reconciliation', 'list', 'List tax reconciliations'),
(gen_random_uuid(), 'tax.reconciliation.update', 'tax', 'reconciliation', 'update', 'Update tax reconciliation'),
(gen_random_uuid(), 'tax.reconciliation.delete', 'tax', 'reconciliation', 'delete', 'Delete tax reconciliation'),

-- Tax Master Data
(gen_random_uuid(), 'tax.master-data.create', 'tax', 'master-data', 'create', 'Create tax master data'),
(gen_random_uuid(), 'tax.master-data.read', 'tax', 'master-data', 'read', 'View tax master data'),
(gen_random_uuid(), 'tax.master-data.list', 'tax', 'master-data', 'list', 'List tax master data'),
(gen_random_uuid(), 'tax.master-data.update', 'tax', 'master-data', 'update', 'Update tax master data'),
(gen_random_uuid(), 'tax.master-data.delete', 'tax', 'master-data', 'delete', 'Delete tax master data'),

-- Tax Dashboard
(gen_random_uuid(), 'tax.dashboard.read', 'tax', 'dashboard', 'read', 'View tax dashboard')
ON CONFLICT DO NOTHING;

-- ===================== TAX ROLE-PERMISSION MAPPINGS =====================

-- Finance Manager: full tax access (tax is closely related to finance)
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Finance Manager'
  AND p.module = 'tax'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Finance Staff: tax create/read/list/update (no delete, no approve/submit)
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Finance Staff'
  AND p.module = 'tax'
  AND p.action IN ('create', 'read', 'list', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager: Full access to tax (except admin)
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Manager'
  AND p.module = 'tax'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Director: Full access to tax
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Director'
  AND p.module = 'tax'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Supervisor: read/list/approve for tax
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Supervisor'
  AND p.module = 'tax'
  AND p.action IN ('read', 'list', 'approve')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Viewer and Staff: read/list only for tax
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('Viewer', 'Staff')
  AND p.module = 'tax'
  AND p.action IN ('read', 'list')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- +goose Down
DELETE FROM role_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE module = 'tax');
DELETE FROM permissions WHERE module = 'tax';
