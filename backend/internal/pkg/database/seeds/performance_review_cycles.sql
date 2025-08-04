-- Performance Review Cycles Seed Data
-- Indonesian Business Context: Shoe Manufacturing & Retail Company

INSERT INTO performance_review_cycles (id, name, description, review_type, start_date, end_date, status) VALUES
-- Annual Reviews
('11111111-1111-1111-1111-111111111111', 'Evaluasi Tahunan 2024', 'Evaluasi kinerja tahunan untuk seluruh karyawan tahun 2024', 'annual', '2024-01-01', '2024-12-31', 'active'),
('22222222-2222-2222-2222-222222222222', 'Evaluasi Tahunan 2023', 'Evaluasi kinerja tahunan untuk seluruh karyawan tahun 2023', 'annual', '2023-01-01', '2023-12-31', 'completed'),

-- Quarterly Reviews 2024
('33333333-3333-3333-3333-333333333333', 'Evaluasi Q1 2024', 'Evaluasi kinerja triwulan pertama 2024 (Januari - Maret)', 'quarterly', '2024-01-01', '2024-03-31', 'completed'),
('44444444-4444-4444-4444-444444444444', 'Evaluasi Q2 2024', 'Evaluasi kinerja triwulan kedua 2024 (April - Juni)', 'quarterly', '2024-04-01', '2024-06-30', 'completed'),
('55555555-5555-5555-5555-555555555555', 'Evaluasi Q3 2024', 'Evaluasi kinerja triwulan ketiga 2024 (Juli - September)', 'quarterly', '2024-07-01', '2024-09-30', 'active'),
('66666666-6666-6666-6666-666666666666', 'Evaluasi Q4 2024', 'Evaluasi kinerja triwulan keempat 2024 (Oktober - Desember)', 'quarterly', '2024-10-01', '2024-12-31', 'draft'),

-- Mid-Year Reviews
('77777777-7777-7777-7777-777777777777', 'Evaluasi Tengah Tahun 2024', 'Evaluasi tengah tahun untuk assessment dan penyesuaian target', 'mid-year', '2024-06-01', '2024-07-31', 'completed'),

-- Probation Reviews
('88888888-8888-8888-8888-888888888888', 'Evaluasi Masa Percobaan Batch 1/2024', 'Evaluasi masa percobaan untuk karyawan baru periode Januari-Maret 2024', 'probation', '2024-01-01', '2024-06-30', 'completed'),
('99999999-9999-9999-9999-999999999999', 'Evaluasi Masa Percobaan Batch 2/2024', 'Evaluasi masa percobaan untuk karyawan baru periode April-Juni 2024', 'probation', '2024-04-01', '2024-09-30', 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Evaluasi Masa Percobaan Batch 3/2024', 'Evaluasi masa percobaan untuk karyawan baru periode Juli-September 2024', 'probation', '2024-07-01', '2024-12-31', 'active');