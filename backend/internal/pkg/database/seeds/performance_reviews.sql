-- Performance Reviews Seed Data
-- Indonesian Shoe Manufacturing & Retail Business Context

INSERT INTO performance_reviews (
    id, employee_id, review_cycle_id, reviewer_id, review_period, overall_score, 
    status, review_date, submission_date, completion_date, notes, 
    self_review_completed, manager_review_completed
) VALUES
-- Q2 2024 Reviews - Completed
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 'Q2 2024', 4.2, 'completed', '2024-07-15', '2024-07-10 09:00:00', '2024-07-15 16:30:00', 'Budi menunjukkan peningkatan yang baik dalam kepemimpinan tim operasional. Perlu perbaikan dalam komunikasi lintas departemen.', true, true),

('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'Q2 2024', 4.7, 'completed', '2024-07-20', '2024-07-18 14:00:00', '2024-07-20 11:45:00', 'Sari menunjukkan performa penjualan yang sangat baik dengan pencapaian target 120%. Komunikasi dengan pelanggan sangat memuaskan.', true, true),

('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'Q2 2024', 3.8, 'completed', '2024-07-25', '2024-07-22 10:30:00', '2024-07-25 15:20:00', 'Ahmad menunjukkan kompetensi teknis yang baik dalam logistik. Perlu meningkatkan inisiatif dan komunikasi proaktif.', true, true),

('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'Q2 2024', 4.5, 'completed', '2024-07-18', '2024-07-15 13:00:00', '2024-07-18 17:00:00', 'Dewi menunjukkan kemampuan penjualan yang sangat baik dalam mengelola klien dan closing deals.', true, true),

('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Q2 2024', 4.1, 'completed', '2024-07-12', '2024-07-08 16:00:00', '2024-07-12 14:30:00', 'Rudi menunjukkan peningkatan dalam koordinasi logistik. Perlu konsistensi dalam menerapkan prosedur.', true, true),

-- Q2 2024 Reviews - Pending
('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 'Q2 2024', NULL, 'pending', '2024-07-28', '2024-07-25 09:30:00', NULL, 'Menunggu finalisasi review dari manager.', true, false),

('77777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 'Q2 2024', NULL, 'pending', '2024-07-30', '2024-07-28 11:00:00', NULL, 'Review dalam proses finalisasi.', true, false),

-- Annual 2024 Reviews - In Progress
('88888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'Annual 2024', 4.1, 'completed', '2024-06-30', '2024-06-25 10:00:00', '2024-06-30 16:00:00', 'Andi menunjukkan performa keamanan yang baik dengan konsistensi dalam menjaga asset perusahaan.', true, true),

-- Probation Reviews
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', 'Probation', 4.0, 'completed', '2024-06-15', '2024-06-10 09:00:00', '2024-06-15 15:30:00', 'Farid menunjukkan adaptasi yang baik selama masa percobaan. Recommended untuk konfirmasi karyawan tetap.', true, true),

-- Overdue Reviews
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 'Q2 2024', NULL, 'overdue', '2024-07-10', NULL, NULL, 'Review terlambat, perlu dijadwalkan ulang.', false, false),

-- Draft Reviews (Q3 2024)
('cccccccc-cccc-cccc-cccc-cccccccccccc', '88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', 'Q3 2024', NULL, 'draft', '2024-10-15', NULL, NULL, 'Review Q3 dalam persiapan.', false, false),

-- Mid-Year Reviews
('dddddddd-dddd-dddd-dddd-dddddddddddd', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', 'Mid-Year 2024', 4.2, 'completed', '2024-06-15', '2024-06-10 11:00:00', '2024-06-15 16:30:00', 'Lina menunjukkan progress yang baik di tengah tahun dalam mengelola SDM.', true, true);