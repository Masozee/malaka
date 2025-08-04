-- Work Orders Seed Data
-- Note: This assumes warehouses table exists with id 1 and 2

-- Insert work orders
INSERT INTO work_orders (
    work_order_number, type, product_id, product_code, product_name, 
    quantity, planned_start_date, planned_end_date, actual_start_date, actual_end_date,
    status, priority, warehouse_id, supervisor, total_cost, actual_cost, 
    efficiency, quality_score, notes, created_by
) VALUES
-- WO-2024-001: Classic Oxford Brown (In Progress)
('WO-2024-001', 'production', 'PROD001', 'SHOE-001', 'Classic Oxford Brown', 
 50, '2024-07-25', '2024-07-30', '2024-07-25', NULL,
 'in_progress', 'high', 1, 'EMP004', 15000000, 8750000, 
 85.5, 0, 'Priority order for VIP customer', 'production@malaka.co.id'),

-- WO-2024-002: Sports Sneaker White (Scheduled)
('WO-2024-002', 'production', 'PROD002', 'SHOE-002', 'Sports Sneaker White', 
 100, '2024-07-28', '2024-08-05', NULL, NULL,
 'scheduled', 'normal', 1, 'EMP009', 25000000, 0, 
 0, 0, 'Large batch for sports retail chain', 'production@malaka.co.id'),

-- WO-2024-003: Work Boot Black (Completed)
('WO-2024-003', 'production', 'PROD003', 'BOOT-001', 'Work Boot Black', 
 75, '2024-07-22', '2024-07-28', '2024-07-22', '2024-07-27',
 'completed', 'high', 2, 'EMP012', 32500000, 31200000, 
 92.8, 98.5, 'Industrial order completed successfully', 'production@malaka.co.id'),

-- WO-2024-004: Summer Sandal Brown (Draft)
('WO-2024-004', 'assembly', 'PROD004', 'SANDAL-001', 'Summer Sandal Brown', 
 200, '2024-07-30', '2024-08-03', NULL, NULL,
 'draft', 'normal', 1, 'EMP015', 26000000, 0, 
 0, 0, 'Summer collection batch for retail stores', 'production@malaka.co.id'),

-- WO-2024-005: Formal Loafer Black (Paused)
('WO-2024-005', 'production', 'PROD005', 'SHOE-003', 'Formal Loafer Black', 
 60, '2024-07-26', '2024-08-01', '2024-07-26', NULL,
 'paused', 'low', 1, 'EMP018', 22000000, 5500000, 
 75.0, 0, 'Production paused for machine maintenance', 'production@malaka.co.id'),

-- WO-2024-006: Luxury Heel Black (Cancelled)
('WO-2024-006', 'repair', 'PROD006', 'SHOE-004', 'Luxury Heel Black', 
 25, '2024-07-29', '2024-08-02', NULL, NULL,
 'cancelled', 'urgent', 1, 'EMP020', 5000000, 0, 
 0, 0, 'Cancelled due to client change of mind', 'production@malaka.co.id'),

-- WO-2024-007: Running Shoe Blue (Scheduled)
('WO-2024-007', 'packaging', 'PROD007', 'SHOE-005', 'Running Shoe Blue', 
 120, '2024-07-31', '2024-08-02', NULL, NULL,
 'scheduled', 'high', 2, 'EMP024', 2500000, 0, 
 0, 0, 'Bulk packaging for export order', 'production@malaka.co.id'),

-- WO-2024-008: Stitching Machine Overhaul (Scheduled)
('WO-2024-008', 'maintenance', 'PROD008', 'EQUIP-001', 'Stitching Machine Overhaul', 
 3, '2024-08-01', '2024-08-03', NULL, NULL,
 'scheduled', 'urgent', 1, 'EMP026', 12000000, 0, 
 0, 0, 'Critical maintenance to prevent production delays', 'maintenance@malaka.co.id'),

-- WO-2024-009: Kids Sneaker Rainbow (Draft)
('WO-2024-009', 'production', 'PROD009', 'SHOE-006', 'Kids Sneaker Rainbow', 
 150, '2024-08-05', '2024-08-12', NULL, NULL,
 'draft', 'normal', 1, 'EMP030', 18500000, 0, 
 0, 0, 'Back-to-school special collection', 'production@malaka.co.id'),

-- WO-2024-010: Hiking Boot Brown (Scheduled)
('WO-2024-010', 'production', 'PROD010', 'BOOT-002', 'Hiking Boot Brown', 
 80, '2024-08-03', '2024-08-10', NULL, NULL,
 'scheduled', 'high', 2, 'EMP033', 35000000, 0, 
 0, 0, 'Outdoor sports collection for adventure stores', 'production@malaka.co.id');

-- Insert work order materials
INSERT INTO work_order_materials (
    work_order_id, article_id, article_code, article_name,
    required_quantity, allocated_quantity, consumed_quantity, 
    unit_cost, total_cost, waste_quantity
) VALUES
-- Materials for WO-2024-001 (Classic Oxford Brown)
(1, 'ART001', 'LEATHER-001', 'Premium Leather Brown', 50, 50, 25, 150000, 7500000, 2),
(1, 'ART002', 'SOLE-001', 'Rubber Sole Premium', 50, 50, 25, 85000, 4250000, 1),

-- Materials for WO-2024-002 (Sports Sneaker White)
(2, 'ART003', 'FABRIC-001', 'Canvas Fabric White', 100, 100, 0, 45000, 4500000, 0),
(2, 'ART004', 'SOLE-002', 'EVA Sole White', 100, 100, 0, 65000, 6500000, 0),
(2, 'ART005', 'LACES-001', 'Polyester Laces White', 200, 200, 0, 5000, 1000000, 0),

-- Materials for WO-2024-003 (Work Boot Black) - Completed
(3, 'ART006', 'LEATHER-002', 'Work Leather Black', 75, 75, 75, 180000, 13500000, 3),
(3, 'ART007', 'SOLE-003', 'Rubber Work Sole', 75, 75, 75, 95000, 7125000, 1),
(3, 'ART008', 'STEEL-001', 'Steel Toe Cap', 75, 75, 75, 45000, 3375000, 0),

-- Materials for WO-2024-004 (Summer Sandal Brown) - Draft
(4, 'ART009', 'LEATHER-003', 'Sandal Leather Brown', 200, 0, 0, 65000, 13000000, 0),
(4, 'ART010', 'SOLE-004', 'EVA Sandal Sole', 200, 0, 0, 35000, 7000000, 0),
(4, 'ART011', 'STRAP-001', 'Adjustable Strap Brown', 400, 0, 0, 15000, 6000000, 0),

-- Materials for WO-2024-005 (Formal Loafer Black) - Paused
(5, 'ART012', 'LEATHER-004', 'Patent Leather Black', 60, 60, 15, 220000, 13200000, 1),
(5, 'ART013', 'SOLE-005', 'Leather Sole Brown', 60, 60, 15, 85000, 5100000, 0),

-- Materials for WO-2024-006 (Luxury Heel Black) - Cancelled
(6, 'ART014', 'HEEL-001', 'Stiletto Heel 10cm', 25, 0, 0, 125000, 3125000, 0),

-- Materials for WO-2024-007 (Running Shoe Blue) - Packaging
(7, 'ART015', 'BOX-001', 'Shoe Box Premium', 120, 120, 0, 8000, 960000, 0),
(7, 'ART016', 'PAPER-001', 'Tissue Paper White', 240, 240, 0, 1500, 360000, 0),

-- Materials for WO-2024-008 (Machine Maintenance)
(8, 'ART017', 'PART-001', 'Machine Parts Kit', 3, 3, 0, 2500000, 7500000, 0),
(8, 'ART018', 'OIL-001', 'Machine Oil Premium', 6, 6, 0, 150000, 900000, 0),

-- Materials for WO-2024-009 (Kids Sneaker Rainbow) - Draft
(9, 'ART019', 'FABRIC-002', 'Colorful Mesh Fabric', 150, 0, 0, 55000, 8250000, 0),
(9, 'ART020', 'SOLE-006', 'Kids EVA Sole Multi', 150, 0, 0, 42000, 6300000, 0),

-- Materials for WO-2024-010 (Hiking Boot Brown)
(10, 'ART021', 'LEATHER-005', 'Waterproof Leather Brown', 80, 80, 0, 195000, 15600000, 0),
(10, 'ART022', 'SOLE-007', 'Hiking Sole Vibram', 80, 80, 0, 120000, 9600000, 0),
(10, 'ART023', 'LINING-001', 'Breathable Lining', 80, 80, 0, 35000, 2800000, 0);

-- Insert work order operations
INSERT INTO work_order_operations (
    work_order_id, operation_number, name, description,
    planned_duration, actual_duration, status, assigned_to, machine_id,
    start_time, end_time, notes
) VALUES
-- Operations for WO-2024-001 (Classic Oxford Brown - In Progress)
(1, 1, 'Cutting', 'Cut leather according to patterns', 8, 6, 'completed', 'EMP001', 'MACH001', 
 '2024-07-25 08:00:00', '2024-07-25 14:00:00', 'Completed ahead of schedule'),
(1, 2, 'Stitching', 'Stitch upper parts together', 12, 8, 'in_progress', 'EMP002', 'MACH002', 
 '2024-07-25 14:00:00', NULL, 'Progress going well'),
(1, 3, 'Assembly', 'Attach sole to upper', 6, 0, 'pending', 'EMP003', 'MACH003', 
 NULL, NULL, NULL),

-- Operations for WO-2024-002 (Sports Sneaker White - Scheduled)
(2, 1, 'Pattern Cutting', 'Cut fabric according to sneaker patterns', 10, 0, 'pending', 'EMP005', 'MACH004', 
 NULL, NULL, NULL),
(2, 2, 'Stitching & Assembly', 'Stitch upper parts and prepare for sole attachment', 16, 0, 'pending', 'EMP006', 'MACH005', 
 NULL, NULL, NULL),
(2, 3, 'Sole Molding', 'Mold and attach EVA soles', 8, 0, 'pending', 'EMP007', 'MACH006', 
 NULL, NULL, NULL),
(2, 4, 'Finishing', 'Add laces, final inspection, packaging', 6, 0, 'pending', 'EMP008', NULL, 
 NULL, NULL, NULL),

-- Operations for WO-2024-003 (Work Boot Black - Completed)
(3, 1, 'Leather Cutting', 'Cut thick work leather with reinforcement patterns', 12, 11, 'completed', 'EMP010', 'MACH007', 
 '2024-07-22 08:00:00', '2024-07-22 19:00:00', 'Good efficiency with new cutting die'),
(3, 2, 'Steel Toe Installation', 'Install and secure steel toe caps', 6, 6, 'completed', 'EMP011', 'MACH008', 
 '2024-07-23 08:00:00', '2024-07-23 14:00:00', 'All steel caps passed quality check'),
(3, 3, 'Heavy Stitching', 'Double-stitch upper with reinforced thread', 18, 16, 'completed', 'EMP010', 'MACH009', 
 '2024-07-23 14:00:00', '2024-07-24 22:00:00', 'Machine performed well, ahead of schedule'),
(3, 4, 'Sole Bonding', 'Bond heavy-duty sole with industrial adhesive', 8, 8, 'completed', 'EMP011', 'MACH010', 
 '2024-07-25 08:00:00', '2024-07-25 16:00:00', 'Strong bond achieved, passed pull tests'),
(3, 5, 'Quality Control', 'Final inspection and safety compliance check', 4, 3, 'completed', 'EMP012', NULL, 
 '2024-07-26 13:00:00', '2024-07-26 16:00:00', '100% pass rate, excellent quality'),

-- Operations for WO-2024-004 (Summer Sandal Brown - Draft)
(4, 1, 'Strap Cutting', 'Cut and prepare leather straps', 6, 0, 'pending', 'EMP013', 'MACH011', 
 NULL, NULL, NULL),
(4, 2, 'Sole Preparation', 'Prepare EVA soles and attachment points', 4, 0, 'pending', 'EMP014', 'MACH012', 
 NULL, NULL, NULL),
(4, 3, 'Assembly', 'Assemble straps to sole base', 8, 0, 'pending', 'EMP013', NULL, 
 NULL, NULL, NULL),

-- Operations for WO-2024-005 (Formal Loafer Black - Paused)
(5, 1, 'Pattern Cutting', 'Precision cutting of patent leather', 8, 4, 'completed', 'EMP016', 'MACH013', 
 '2024-07-26 08:00:00', '2024-07-26 12:00:00', 'Clean cuts achieved'),
(5, 2, 'Upper Construction', 'Stitch and shape upper parts', 12, 6, 'paused', 'EMP017', 'MACH014', 
 '2024-07-26 13:00:00', NULL, 'Paused due to machine maintenance requirement'),

-- Operations for WO-2024-006 (Luxury Heel Black - Cancelled)
(6, 1, 'Damage Assessment', 'Assess extent of heel damage', 2, 0, 'skipped', 'EMP019', NULL, 
 NULL, NULL, 'Order cancelled before assessment'),

-- Operations for WO-2024-007 (Running Shoe Blue - Packaging)
(7, 1, 'Quality Check', 'Final quality inspection before packaging', 4, 0, 'pending', 'EMP021', NULL, 
 NULL, NULL, NULL),
(7, 2, 'Packaging', 'Pack shoes in boxes with tissue paper', 6, 0, 'pending', 'EMP022', NULL, 
 NULL, NULL, NULL),
(7, 3, 'Labeling & Shipping Prep', 'Apply labels and prepare for shipment', 3, 0, 'pending', 'EMP023', NULL, 
 NULL, NULL, NULL),

-- Operations for WO-2024-008 (Machine Maintenance)
(8, 1, 'Disassembly', 'Carefully disassemble machines for inspection', 8, 0, 'pending', 'EMP025', NULL, 
 NULL, NULL, NULL),
(8, 2, 'Parts Replacement', 'Replace worn parts and components', 12, 0, 'pending', 'EMP025', NULL, 
 NULL, NULL, NULL),
(8, 3, 'Reassembly & Testing', 'Reassemble and test machine operation', 6, 0, 'pending', 'EMP025', NULL, 
 NULL, NULL, NULL),

-- Operations for WO-2024-009 (Kids Sneaker Rainbow - Draft)
(9, 1, 'Colorful Cutting', 'Cut mesh fabric in various colors', 10, 0, 'pending', 'EMP027', 'MACH015', 
 NULL, NULL, NULL),
(9, 2, 'Pattern Matching', 'Match color patterns and assemble uppers', 14, 0, 'pending', 'EMP028', 'MACH016', 
 NULL, NULL, NULL),
(9, 3, 'Assembly & Finishing', 'Attach soles and add finishing touches', 12, 0, 'pending', 'EMP029', 'MACH017', 
 NULL, NULL, NULL),

-- Operations for WO-2024-010 (Hiking Boot Brown)
(10, 1, 'Waterproof Treatment', 'Apply waterproof treatment to leather', 6, 0, 'pending', 'EMP031', 'MACH018', 
 NULL, NULL, NULL),
(10, 2, 'Heavy-Duty Construction', 'Reinforce stitching for outdoor use', 16, 0, 'pending', 'EMP032', 'MACH019', 
 NULL, NULL, NULL),
(10, 3, 'Sole Attachment', 'Attach Vibram hiking soles', 8, 0, 'pending', 'EMP031', 'MACH020', 
 NULL, NULL, NULL);

-- Insert work order assignments
INSERT INTO work_order_assignments (work_order_id, employee_id, role) VALUES
-- Assignments for WO-2024-001
(1, 'EMP001', 'operator'),
(1, 'EMP002', 'operator'),
(1, 'EMP003', 'operator'),

-- Assignments for WO-2024-002
(2, 'EMP005', 'operator'),
(2, 'EMP006', 'operator'),
(2, 'EMP007', 'operator'),
(2, 'EMP008', 'operator'),

-- Assignments for WO-2024-003
(3, 'EMP010', 'senior_operator'),
(3, 'EMP011', 'operator'),

-- Assignments for WO-2024-004
(4, 'EMP013', 'operator'),
(4, 'EMP014', 'operator'),

-- Assignments for WO-2024-005
(5, 'EMP016', 'operator'),
(5, 'EMP017', 'operator'),

-- Assignments for WO-2024-006
(6, 'EMP019', 'specialist'),

-- Assignments for WO-2024-007
(7, 'EMP021', 'quality_inspector'),
(7, 'EMP022', 'packer'),
(7, 'EMP023', 'packer'),

-- Assignments for WO-2024-008
(8, 'EMP025', 'maintenance_technician'),

-- Assignments for WO-2024-009
(9, 'EMP027', 'operator'),
(9, 'EMP028', 'operator'),
(9, 'EMP029', 'operator'),

-- Assignments for WO-2024-010
(10, 'EMP031', 'senior_operator'),
(10, 'EMP032', 'operator');