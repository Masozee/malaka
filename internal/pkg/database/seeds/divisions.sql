-- Development seed data for business divisions
-- Professional hierarchy structure suitable for most businesses
INSERT INTO divisions (code, name, description, parent_id, level, is_active) VALUES
-- Root divisions (Level 1) - will get auto-generated UUIDs
('RETAIL', 'Retail Division', 'Retail operations and sales', NULL, 1, true),
('WHOLESALE', 'Wholesale Division', 'Wholesale distribution and B2B sales', NULL, 1, true),
('OPERATIONS', 'Operations Division', 'Supply chain and logistics operations', NULL, 1, true);

-- Sub-divisions under Retail (Level 2)
-- Note: parent_id will need to be populated after root divisions are created
-- This is demonstration data - in practice, you'd need to query for parent UUIDs
/*
INSERT INTO divisions (code, name, description, parent_id, level, is_active) VALUES
('RETAIL_ONLINE', 'Online Retail', 'E-commerce and online sales', (SELECT id FROM divisions WHERE code='RETAIL'), 2, true),
('RETAIL_STORE', 'Physical Stores', 'Brick and mortar retail stores', (SELECT id FROM divisions WHERE code='RETAIL'), 2, true),
('WHOLESALE_DOM', 'Domestic Wholesale', 'Local and national wholesale distribution', (SELECT id FROM divisions WHERE code='WHOLESALE'), 2, true),
('WHOLESALE_EXP', 'Export Wholesale', 'International wholesale and export', (SELECT id FROM divisions WHERE code='WHOLESALE'), 2, true),
('OPS_WAREHOUSE', 'Warehouse Operations', 'Inventory and warehouse management', (SELECT id FROM divisions WHERE code='OPERATIONS'), 2, true),
('OPS_LOGISTICS', 'Logistics Operations', 'Transportation and delivery', (SELECT id FROM divisions WHERE code='OPERATIONS'), 2, true);
*/

-- Note: Sub-divisions with parent relationships should be created programmatically
-- or through separate seeding scripts that can reference parent UUIDs