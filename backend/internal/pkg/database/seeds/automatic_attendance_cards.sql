-- Automatic Attendance Cards seed data
INSERT INTO automatic_attendance_cards (employee_id, card_number, rfid_tag, issue_date, expiry_date, is_active) VALUES
((SELECT id FROM users WHERE email = 'admin@malaka.co.id' LIMIT 1), 'CARD001', 'RFID001', '2024-01-01', '2025-12-31', true),
((SELECT id FROM users WHERE email = 'manager@malaka.co.id' LIMIT 1), 'CARD002', 'RFID002', '2024-01-01', '2025-12-31', true),
((SELECT id FROM users WHERE email = 'staff@malaka.co.id' LIMIT 1), 'CARD003', 'RFID003', '2024-01-01', '2025-12-31', true),
((SELECT id FROM users WHERE email = 'cashier@malaka.co.id' LIMIT 1), 'CARD004', 'RFID004', '2024-01-01', '2025-12-31', true),
((SELECT id FROM users WHERE email = 'supervisor@malaka.co.id' LIMIT 1), 'CARD005', 'RFID005', '2024-01-01', '2025-12-31', true),
((SELECT id FROM users WHERE email = 'admin@malaka.co.id' LIMIT 1), 'CARD006', 'RFID006', '2024-02-01', '2025-12-31', true),
((SELECT id FROM users WHERE email = 'manager@malaka.co.id' LIMIT 1), 'CARD007', 'RFID007', '2024-02-01', '2025-12-31', true),
((SELECT id FROM users WHERE email = 'staff@malaka.co.id' LIMIT 1), 'CARD008', 'RFID008', '2024-02-01', '2025-12-31', true),
((SELECT id FROM users WHERE email = 'cashier@malaka.co.id' LIMIT 1), 'CARD009', 'RFID009', '2024-02-01', '2025-12-31', true),
((SELECT id FROM users WHERE email = 'supervisor@malaka.co.id' LIMIT 1), 'CARD010', 'RFID010', '2024-02-01', '2025-12-31', true);