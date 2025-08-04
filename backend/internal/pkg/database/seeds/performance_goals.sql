-- Performance Goals Seed Data
-- Indonesian Shoe Manufacturing & Retail Business Context

INSERT INTO performance_goals (id, title, description, category, weight, target_value, measurement_unit) VALUES
-- Production Goals
('11111111-1111-1111-1111-111111111111', 'Target Produksi Sepatu', 'Mencapai target produksi sepatu sesuai dengan rencana bulanan', 'production', 1.5, '1000', 'pairs per month'),
('22222222-2222-2222-2222-222222222222', 'Kualitas Produk', 'Mempertahankan tingkat kualitas produk dengan tingkat reject maksimal 3%', 'quality', 1.3, '3', 'percentage'),
('33333333-3333-3333-3333-333333333333', 'Efisiensi Waktu Produksi', 'Meningkatkan efisiensi waktu produksi per unit sepatu', 'efficiency', 1.2, '95', 'percentage'),
('44444444-4444-4444-4444-444444444444', 'Pemeliharaan Mesin', 'Melakukan pemeliharaan mesin sesuai jadwal untuk meminimalkan downtime', 'maintenance', 1.0, '98', 'percentage'),

-- Sales Goals
('55555555-5555-5555-5555-555555555555', 'Target Penjualan Bulanan', 'Mencapai target penjualan sepatu sesuai dengan kuota yang ditetapkan', 'sales', 1.5, '150', 'million IDR'),
('66666666-6666-6666-6666-666666666666', 'Akuisisi Pelanggan Baru', 'Menambah jumlah pelanggan baru untuk memperluas pangsa pasar', 'sales', 1.2, '20', 'new customers'),
('77777777-7777-7777-7777-777777777777', 'Tingkat Kepuasan Pelanggan', 'Mempertahankan tingkat kepuasan pelanggan di atas standar perusahaan', 'customer_service', 1.3, '4.5', 'rating out of 5'),
('88888888-8888-8888-8888-888888888888', 'Follow-up Prospek', 'Melakukan follow-up terhadap prospek pelanggan dalam waktu yang ditentukan', 'sales', 1.0, '90', 'percentage'),

-- Quality Control Goals
('99999999-9999-9999-9999-999999999999', 'Inspeksi Kualitas', 'Melakukan inspeksi kualitas pada 100% produk yang diproduksi', 'quality', 1.4, '100', 'percentage'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dokumentasi QC', 'Melengkapi dokumentasi quality control sesuai standar ISO', 'documentation', 1.1, '100', 'percentage'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Training Quality', 'Mengikuti dan menyelesaikan training quality control yang diwajibkan', 'training', 1.0, '4', 'training sessions'),

-- HR Goals
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Rekrutmen Karyawan', 'Memenuhi kebutuhan rekrutmen karyawan sesuai dengan permintaan departemen', 'recruitment', 1.3, '15', 'new hires'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Employee Engagement', 'Meningkatkan tingkat engagement karyawan melalui program-program HR', 'engagement', 1.2, '85', 'percentage'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Pelatihan Karyawan', 'Menyelenggarakan program pelatihan untuk pengembangan skill karyawan', 'training', 1.1, '24', 'training hours'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Employee Retention', 'Mempertahankan tingkat retensi karyawan di atas standar industri', 'retention', 1.4, '90', 'percentage'),

-- Warehouse Goals
('10101010-1010-1010-1010-101010101010', 'Akurasi Inventory', 'Mempertahankan akurasi inventory di atas 98%', 'inventory', 1.3, '98', 'percentage'),
('20202020-2020-2020-2020-202020202020', 'Kecepatan Pengiriman', 'Memproses dan mengirim pesanan dalam waktu maksimal 24 jam', 'logistics', 1.2, '24', 'hours'),
('30303030-3030-3030-3030-303030303030', 'Keamanan Gudang', 'Mempertahankan tingkat keamanan gudang tanpa insiden kehilangan', 'security', 1.1, '100', 'percentage'),
('40404040-4040-4040-4040-404040404040', 'Organisasi Gudang', 'Mempertahankan organisasi dan kebersihan gudang sesuai standar 5S', 'organization', 1.0, '95', 'percentage'),

-- Finance & Accounting Goals
('50505050-5050-5050-5050-505050505050', 'Ketepatan Laporan', 'Menyusun laporan keuangan tepat waktu sesuai jadwal yang ditetapkan', 'reporting', 1.4, '100', 'percentage'),
('60606060-6060-6060-6060-606060606060', 'Cost Control', 'Mengendalikan biaya operasional sesuai dengan budget yang ditetapkan', 'cost_control', 1.3, '5', 'percentage variance'),
('70707070-7070-7070-7070-707070707070', 'Audit Compliance', 'Mempertahankan compliance audit internal dan eksternal', 'compliance', 1.2, '100', 'percentage'),

-- General Development Goals
('80808080-8080-8080-8080-808080808080', 'Pengembangan Skill', 'Mengikuti program pengembangan skill sesuai dengan rencana karir', 'development', 1.0, '2', 'courses completed'),
('90909090-9090-9090-9090-909090909090', 'Inisiatif Perbaikan', 'Memberikan inisiatif perbaikan proses kerja untuk meningkatkan efisiensi', 'innovation', 1.1, '2', 'improvement initiatives'),
('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'Kolaborasi Tim', 'Menunjukkan kemampuan kerja sama tim yang baik dalam project bersama', 'teamwork', 1.0, '4.0', 'rating out of 5');