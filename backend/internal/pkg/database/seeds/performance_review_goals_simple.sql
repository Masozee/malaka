-- Performance Review Goals Seed Data (Simplified)
-- Links performance reviews with specific goals and their achievements

INSERT INTO performance_review_goals (
    id, performance_review_id, goal_id, target_value, actual_value, 
    achievement_percentage, is_achieved, comments
) VALUES
-- Budi Santoso (Manager Operasional) Q2 2024 Goals
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '3000', '2850', 95.00, true, 'Target produksi hampir tercapai, sedikit tertinggal karena maintenance mesin di bulan Juni'),
('12121212-1212-1212-1212-121212121212', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '3', '2.8', 93.33, true, 'Tingkat reject berhasil dijaga di bawah target, quality control berjalan baik'),
('13131313-1313-1313-1313-131313131313', '11111111-1111-1111-1111-111111111111', '90909090-9090-9090-9090-909090909090', '2', '3', 150.00, true, 'Memberikan 3 inisiatif perbaikan: optimasi layout, jadwal maintenance baru, dan training operator'),

-- Sari Dewi (Supervisor Penjualan) Q2 2024 Goals
('21212121-2121-2121-2121-212121212121', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '450', '540', 120.00, true, 'Pencapaian penjualan melampaui target, berhasil closing beberapa kontrak besar'),
('22222221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', '60', '78', 130.00, true, 'Akuisisi pelanggan baru sangat baik, terutama dari segmen retail modern'),
('23232323-2323-2323-2323-232323232323', '22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', '4.5', '4.7', 104.44, true, 'Tingkat kepuasan pelanggan meningkat berkat pelayanan yang konsisten'),

-- Ahmad Hidayat (Staff Logistik) Q2 2024 Goals  
('31313131-3131-3131-3131-313131313131', '33333333-3333-3333-3333-333333333333', '10101010-1010-1010-1010-101010101010', '98', '96.5', 98.47, false, 'Akurasi inventory cukup baik tapi masih perlu perbaikan dalam pencatatan'),
('32323232-3232-3232-3232-323232323232', '33333333-3333-3333-3333-333333333333', '20202020-2020-2020-2020-202020202020', '24', '20', 83.33, true, 'Kecepatan pengiriman meningkat signifikan, average 20 jam per pesanan'),

-- Dewi Permatasari (Staff Penjualan) Q2 2024 Goals
('41414141-4141-4141-4141-414141414141', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '300', '350', 116.67, true, 'Pencapaian penjualan sangat baik untuk fresh graduate'),
('42424242-4242-4242-4242-424242424242', '44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', '4.5', '4.6', 102.22, true, 'Tingkat kepuasan pelanggan baik'),

-- Rudi Hartono (Staff Logistik) Q2 2024 Goals
('51515151-5151-5151-5151-515151515151', '55555555-5555-5555-5555-555555555555', '10101010-1010-1010-1010-101010101010', '98', '97.5', 99.49, false, 'Akurasi inventory sudah baik, perlu konsistensi'),
('52525252-5252-5252-5252-525252525252', '55555555-5555-5555-5555-555555555555', '40404040-4040-4040-4040-404040404040', '95', '93', 97.89, false, 'Organisasi gudang sudah baik tapi masih perlu konsistensi penerapan 5S');