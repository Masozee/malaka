-- Performance Review Goals Seed Data
-- Links performance reviews with specific goals and their achievements

INSERT INTO performance_review_goals (
    id, performance_review_id, goal_id, target_value, actual_value, 
    achievement_percentage, is_achieved, comments
) VALUES
-- Budi Santoso (Manager Operasional) Q2 2024 Goals
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '3000', '2850', 95.00, true, 'Target produksi hampir tercapai, sedikit tertinggal karena maintenance mesin di bulan Juni'),
('12121212-1212-1212-1212-121212121212', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '3', '2.8', 93.33, true, 'Tingkat reject berhasil dijaga di bawah target, quality control berjalan baik'),
('13131313-1313-1313-1313-131313131313', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '98', '96', 97.96, false, 'Ada beberapa unplanned downtime yang mempengaruhi target maintenance'),
('14141414-1414-1414-1414-141414141414', '11111111-1111-1111-1111-111111111111', '90909090-9090-9090-9090-909090909090', '2', '3', 150.00, true, 'Memberikan 3 inisiatif perbaikan: optimasi layout, jadwal maintenance baru, dan training operator'),

-- Sari Dewi (Supervisor Penjualan) Q2 2024 Goals
('21212121-2121-2121-2121-212121212121', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '450', '540', 120.00, true, 'Pencapaian penjualan melampaui target, berhasil closing beberapa kontrak besar'),
('22222221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', '60', '78', 130.00, true, 'Akuisisi pelanggan baru sangat baik, terutama dari segmen retail modern'),
('23232323-2323-2323-2323-232323232323', '22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', '4.5', '4.7', 104.44, true, 'Tingkat kepuasan pelanggan meningkat berkat pelayanan yang konsisten'),
('24242424-2424-2424-2424-242424242424', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', '90', '95', 105.56, true, 'Follow-up prospek dilakukan dengan sangat baik dan sistematis'),

-- Ahmad Hidayat (Staff Gudang) Q2 2024 Goals  
('31313131-3131-3131-3131-313131313131', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', '100', '97', 97.00, false, 'Inspeksi QC sudah baik, masih ada beberapa lot yang terlewat saat shift malam'),
('32323232-3232-3232-3232-323232323232', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '100', '85', 85.00, false, 'Dokumentasi QC masih kurang lengkap, perlu pelatihan sistem dokumentasi'),
('33333332-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '4', '3', 75.00, false, 'Mengikuti 3 dari 4 training yang dijadwalkan, 1 training tertunda karena sakit'),
('34343434-3434-3434-3434-343434343434', '33333333-3333-3333-3333-333333333333', '10101010-1010-1010-1010-101010101010', '98', '96.5', 98.47, false, 'Akurasi inventory cukup baik tapi masih perlu perbaikan dalam pencatatan'),

-- Maya Sari Putri (Staff Keuangan) Q2 2024 Goals
('41414141-4141-4141-4141-414141414141', '44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '45', '52', 115.56, true, 'Berhasil rekrut 52 karyawan baru, melebihi target karena ekspansi produksi'),
('42424242-4242-4242-4242-424242424242', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '85', '88', 103.53, true, 'Program engagement karyawan berjalan baik dengan berbagai aktivitas baru'),
('43434343-4343-4343-4343-434343434343', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '72', '84', 116.67, true, 'Program pelatihan berjalan sangat baik dengan partisipasi tinggi'),
('44444443-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '90', '92', 102.22, true, 'Tingkat retensi karyawan terjaga dengan baik'),

-- Andi Wijaya (Staff Keamanan) Q2 2024 Goals
('51515151-5151-5151-5151-515151515151', '55555555-5555-5555-5555-555555555555', '20202020-2020-2020-2020-202020202020', '24', '20', 83.33, true, 'Kecepatan pengiriman meningkat signifikan, average 20 jam per pesanan'),
('52525252-5252-5252-5252-525252525252', '55555555-5555-5555-5555-555555555555', '30303030-3030-3030-3030-303030303030', '100', '100', 100.00, true, 'Tidak ada insiden keamanan selama quarter ini'),
('53535353-5353-5353-5353-535353535353', '55555555-5555-5555-5555-555555555555', '40404040-4040-4040-4040-404040404040', '95', '92', 96.84, false, 'Organisasi gudang sudah baik tapi masih perlu konsistensi penerapan 5S'),
('54545454-5454-5454-5454-545454545454', '55555555-5555-5555-5555-555555555555', '80808080-8080-8080-8080-808080808080', '2', '1', 50.00, false, 'Baru menyelesaikan 1 course pengembangan skill, perlu follow up untuk course kedua'),

-- Annual Reviews Goals
('61616161-6161-6161-6161-616161616161', '88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', '1800', '2010', 111.67, true, 'Pencapaian penjualan tahunan sangat baik, konsisten sepanjang tahun'),
('62626262-6262-6262-6262-626262626262', '88888888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777', '4.5', '4.8', 106.67, true, 'Tingkat kepuasan pelanggan meningkat konsisten sepanjang tahun'),

('71717171-7171-7171-7171-717171717171', '99999999-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999999', '100', '99.2', 99.20, false, 'Inspeksi QC hampir sempurna sepanjang tahun, sedikit tertinggal di bulan terakhir'),
('72727272-7272-7272-7272-727272727272', '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', '3', '2.5', 83.33, true, 'Tingkat reject berhasil ditekan di bawah target sepanjang tahun'),

-- Probation Reviews Goals  
('81818181-8181-8181-8181-818181818181', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '80808080-8080-8080-8080-808080808080', '2', '2', 100.00, true, 'Menyelesaikan program orientasi dan training dasar dengan baik'),
('82828282-8282-8282-8282-828282828282', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', '4.0', '4.2', 105.00, true, 'Kolaborasi tim sangat baik selama masa percobaan'),

('91919191-9191-9191-9191-919191919191', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '800', '920', 115.00, true, 'Mencapai target produksi dengan sangat baik selama masa percobaan'),
('92929292-9292-9292-9292-929292929292', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '3', '2.2', 73.33, true, 'Kualitas produk konsisten baik selama masa percobaan');