-- Leave Types seed data (Indonesian business context)
INSERT INTO leave_types (id, name, code, description, max_days_per_year, requires_approval, is_paid, is_active, created_at, updated_at) VALUES
-- Standard leave types in Indonesian companies
('11111111-1111-1111-1111-111111111111', 'Cuti Tahunan', 'ANNUAL', 'Cuti tahunan karyawan sesuai peraturan perusahaan', 12, true, true, true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Cuti Sakit', 'SICK', 'Cuti sakit dengan surat keterangan dokter', 30, false, true, true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'Cuti Melahirkan', 'MATERNITY', 'Cuti melahirkan sesuai UU Ketenagakerjaan', 90, true, true, true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'Cuti Keperluan Pribadi', 'PERSONAL', 'Cuti untuk keperluan pribadi/keluarga', 6, true, true, true, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'Cuti Darurat', 'EMERGENCY', 'Cuti darurat untuk kondisi mendesak', 0, true, true, true, NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'Cuti Tanpa Gaji', 'UNPAID', 'Cuti tanpa gaji untuk keperluan khusus', 0, true, false, true, NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', 'Cuti Haji/Umroh', 'PILGRIMAGE', 'Cuti untuk menunaikan ibadah haji atau umroh', 40, true, true, true, NOW(), NOW()),
('88888888-8888-8888-8888-888888888888', 'Cuti Pernikahan', 'MARRIAGE', 'Cuti untuk pernikahan diri sendiri', 3, true, true, true, NOW(), NOW());