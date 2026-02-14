-- +goose Up
-- Seed permissions for finance extended features

INSERT INTO permissions (id, code, module, resource, action, description) VALUES
-- Budget permissions
(gen_random_uuid(), 'finance.budget.create', 'finance', 'budget', 'create', 'Create budget allocations'),
(gen_random_uuid(), 'finance.budget.read', 'finance', 'budget', 'read', 'View budget details'),
(gen_random_uuid(), 'finance.budget.update', 'finance', 'budget', 'update', 'Update budget allocations'),
(gen_random_uuid(), 'finance.budget.delete', 'finance', 'budget', 'delete', 'Delete budget allocations'),
(gen_random_uuid(), 'finance.budget.list', 'finance', 'budget', 'list', 'List all budgets'),
-- CapEx Project permissions
(gen_random_uuid(), 'finance.capex-project.create', 'finance', 'capex-project', 'create', 'Create capex projects'),
(gen_random_uuid(), 'finance.capex-project.read', 'finance', 'capex-project', 'read', 'View capex project details'),
(gen_random_uuid(), 'finance.capex-project.update', 'finance', 'capex-project', 'update', 'Update capex projects'),
(gen_random_uuid(), 'finance.capex-project.delete', 'finance', 'capex-project', 'delete', 'Delete capex projects'),
(gen_random_uuid(), 'finance.capex-project.list', 'finance', 'capex-project', 'list', 'List all capex projects'),
-- Loan Facility permissions
(gen_random_uuid(), 'finance.loan-facility.create', 'finance', 'loan-facility', 'create', 'Create loan facilities'),
(gen_random_uuid(), 'finance.loan-facility.read', 'finance', 'loan-facility', 'read', 'View loan facility details'),
(gen_random_uuid(), 'finance.loan-facility.update', 'finance', 'loan-facility', 'update', 'Update loan facilities'),
(gen_random_uuid(), 'finance.loan-facility.delete', 'finance', 'loan-facility', 'delete', 'Delete loan facilities'),
(gen_random_uuid(), 'finance.loan-facility.list', 'finance', 'loan-facility', 'list', 'List all loan facilities'),
-- Financial Forecast permissions
(gen_random_uuid(), 'finance.financial-forecast.create', 'finance', 'financial-forecast', 'create', 'Create financial forecasts'),
(gen_random_uuid(), 'finance.financial-forecast.read', 'finance', 'financial-forecast', 'read', 'View financial forecast details'),
(gen_random_uuid(), 'finance.financial-forecast.update', 'finance', 'financial-forecast', 'update', 'Update financial forecasts'),
(gen_random_uuid(), 'finance.financial-forecast.delete', 'finance', 'financial-forecast', 'delete', 'Delete financial forecasts'),
(gen_random_uuid(), 'finance.financial-forecast.list', 'finance', 'financial-forecast', 'list', 'List all financial forecasts'),
-- Finance Report permissions
(gen_random_uuid(), 'finance.finance-report.create', 'finance', 'finance-report', 'create', 'Create finance reports'),
(gen_random_uuid(), 'finance.finance-report.read', 'finance', 'finance-report', 'read', 'View finance report details'),
(gen_random_uuid(), 'finance.finance-report.update', 'finance', 'finance-report', 'update', 'Update finance reports'),
(gen_random_uuid(), 'finance.finance-report.delete', 'finance', 'finance-report', 'delete', 'Delete finance reports'),
(gen_random_uuid(), 'finance.finance-report.list', 'finance', 'finance-report', 'list', 'List all finance reports')
ON CONFLICT DO NOTHING;

-- Grant all new permissions to Superadmin role
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Superadmin'
AND (p.code LIKE 'finance.budget.%'
   OR p.code LIKE 'finance.capex-project.%'
   OR p.code LIKE 'finance.loan-facility.%'
   OR p.code LIKE 'finance.financial-forecast.%'
   OR p.code LIKE 'finance.finance-report.%')
ON CONFLICT DO NOTHING;

-- +goose Down
DELETE FROM role_permissions WHERE permission_id IN (
    SELECT id FROM permissions WHERE code LIKE 'finance.budget.%'
    OR code LIKE 'finance.capex-project.%'
    OR code LIKE 'finance.loan-facility.%'
    OR code LIKE 'finance.financial-forecast.%'
    OR code LIKE 'finance.finance-report.%'
);
DELETE FROM permissions WHERE code LIKE 'finance.budget.%'
    OR code LIKE 'finance.capex-project.%'
    OR code LIKE 'finance.loan-facility.%'
    OR code LIKE 'finance.financial-forecast.%'
    OR code LIKE 'finance.finance-report.%';
