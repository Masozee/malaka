-- SPG Stores seed data
INSERT INTO spg_stores (employee_id, store_code, store_name, assignment_date, end_date, commission_rate, target_amount, is_active) VALUES
((SELECT id FROM employees WHERE employee_code = 'EMP006'), 'BDG001', 'Toko Sudirman Bandung', '2024-01-15', NULL, 3.50, 50000000.00, true),
((SELECT id FROM employees WHERE employee_code = 'EMP006'), 'BDG002', 'Toko Paris Van Java Bandung', '2024-03-01', '2024-05-31', 3.00, 45000000.00, false),
((SELECT id FROM employees WHERE employee_code = 'EMP004'), 'YGY001', 'Toko Malioboro Yogyakarta', '2024-02-01', NULL, 4.00, 60000000.00, true),
((SELECT id FROM employees WHERE employee_code = 'EMP005'), 'SBY001', 'Toko Pahlawan Surabaya', '2024-01-20', NULL, 3.75, 55000000.00, true),
((SELECT id FROM employees WHERE employee_code = 'EMP008'), 'MDN001', 'Toko Gajah Mada Medan', '2024-03-15', NULL, 3.25, 40000000.00, true),
((SELECT id FROM employees WHERE employee_code = 'EMP009'), 'MKS001', 'Toko Diponegoro Makassar', '2024-04-10', NULL, 3.00, 35000000.00, true),
((SELECT id FROM employees WHERE employee_code = 'EMP007'), 'SMG001', 'Toko Pemuda Semarang', '2024-02-20', NULL, 3.50, 48000000.00, true),
((SELECT id FROM employees WHERE employee_code = 'EMP013'), 'JKT001', 'Toko Plaza Indonesia Jakarta', '2024-07-15', NULL, 4.50, 75000000.00, true),
((SELECT id FROM employees WHERE employee_code = 'EMP015'), 'JKT002', 'Toko Grand Indonesia Jakarta', '2024-08-15', NULL, 4.25, 70000000.00, true),
((SELECT id FROM employees WHERE employee_code = 'EMP006'), 'BDG003', 'Toko Cihampelas Bandung', '2024-06-01', NULL, 3.75, 52000000.00, true);