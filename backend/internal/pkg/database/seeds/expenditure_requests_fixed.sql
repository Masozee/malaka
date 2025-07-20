-- Expenditure Requests seed data for Malaka ERP
INSERT INTO expenditure_requests (
    id, request_number, requestor_id, department, request_date, required_date, 
    purpose, total_amount, approved_amount, status, priority, approved_by, 
    approved_at, processed_by, processed_at, remarks, created_at, updated_at
) VALUES 
(gen_random_uuid(), 'ER20240701001', gen_random_uuid(), 'Penjualan', '2024-07-01', '2024-07-05', 
 'Biaya promosi dan iklan toko Jakarta', 5000000.00, 4500000.00, 'APPROVED', 'HIGH', 
 gen_random_uuid(), '2024-07-02 10:00:00', gen_random_uuid(), '2024-07-03 14:30:00', 
 'Disetujui dengan pengurangan budget 500k', NOW(), NOW()),

(gen_random_uuid(), 'ER20240702001', gen_random_uuid(), 'Produksi', '2024-07-02', '2024-07-08', 
 'Pembelian mesin jahit baru untuk line produksi', 25000000.00, 25000000.00, 'APPROVED', 'HIGH', 
 gen_random_uuid(), '2024-07-04 09:15:00', gen_random_uuid(), '2024-07-05 11:20:00', 
 'Disetujui penuh untuk peningkatan kapasitas produksi', NOW(), NOW()),

(gen_random_uuid(), 'ER20240703001', gen_random_uuid(), 'IT', '2024-07-03', '2024-07-10', 
 'Upgrade sistem komputer dan software ERP', 15000000.00, 12000000.00, 'APPROVED', 'NORMAL', 
 gen_random_uuid(), '2024-07-06 13:45:00', gen_random_uuid(), '2024-07-07 16:00:00', 
 'Disetujui dengan penyesuaian spesifikasi hardware', NOW(), NOW()),

(gen_random_uuid(), 'ER20240704001', gen_random_uuid(), 'HR', '2024-07-04', '2024-07-12', 
 'Training karyawan dan program sertifikasi', 8000000.00, 0.00, 'REJECTED', 'LOW', 
 gen_random_uuid(), '2024-07-08 10:30:00', NULL, NULL, 
 'Ditolak karena budget training sudah habis untuk quarter ini', NOW(), NOW()),

(gen_random_uuid(), 'ER20240705001', gen_random_uuid(), 'Maintenance', '2024-07-05', '2024-07-07', 
 'Perbaikan urgent mesin cutting di line 2', 3500000.00, 3500000.00, 'APPROVED', 'URGENT', 
 gen_random_uuid(), '2024-07-05 15:00:00', gen_random_uuid(), '2024-07-06 08:30:00', 
 'Disetujui urgent untuk mencegah downtime produksi', NOW(), NOW()),

(gen_random_uuid(), 'ER20240706001', gen_random_uuid(), 'Logistik', '2024-07-06', '2024-07-15', 
 'Sewa gudang tambahan untuk stok seasonal', 12000000.00, 10000000.00, 'APPROVED', 'NORMAL', 
 gen_random_uuid(), '2024-07-09 14:20:00', gen_random_uuid(), '2024-07-10 09:45:00', 
 'Disetujui dengan durasi sewa 6 bulan', NOW(), NOW()),

(gen_random_uuid(), 'ER20240707001', gen_random_uuid(), 'Marketing', '2024-07-07', '2024-07-20', 
 'Event launching produk sepatu baru di mall', 18000000.00, 0.00, 'PENDING', 'NORMAL', 
 NULL, NULL, NULL, NULL, 
 'Menunggu approval dari direktur marketing', NOW(), NOW()),

(gen_random_uuid(), 'ER20240708001', gen_random_uuid(), 'Finance', '2024-07-08', '2024-07-11', 
 'Audit eksternal dan konsultan pajak', 22000000.00, 0.00, 'PENDING', 'HIGH', 
 NULL, NULL, NULL, NULL, 
 'Dalam proses review oleh CFO', NOW(), NOW()),

(gen_random_uuid(), 'ER20240709001', gen_random_uuid(), 'QC', '2024-07-09', '2024-07-18', 
 'Peralatan testing kualitas produk baru', 9500000.00, 9500000.00, 'APPROVED', 'HIGH', 
 gen_random_uuid(), '2024-07-11 11:15:00', gen_random_uuid(), '2024-07-12 13:30:00', 
 'Disetujui untuk menjaga standar kualitas', NOW(), NOW()),

(gen_random_uuid(), 'ER20240710001', gen_random_uuid(), 'Security', '2024-07-10', '2024-07-25', 
 'Upgrade sistem keamanan pabrik dan CCTV', 16000000.00, 14000000.00, 'APPROVED', 'NORMAL', 
 gen_random_uuid(), '2024-07-13 10:45:00', gen_random_uuid(), '2024-07-14 15:20:00', 
 'Disetujui dengan pengurangan untuk fitur premium', NOW(), NOW()),

(gen_random_uuid(), 'ER20240711001', gen_random_uuid(), 'R&D', '2024-07-11', '2024-07-30', 
 'Riset material baru untuk inovasi produk', 13000000.00, 0.00, 'PENDING', 'LOW', 
 NULL, NULL, NULL, NULL, 
 'Menunggu presentasi proposal detail', NOW(), NOW()),

(gen_random_uuid(), 'ER20240712001', gen_random_uuid(), 'Purchasing', '2024-07-12', '2024-07-16', 
 'Down payment supplier untuk kontrak jangka panjang', 45000000.00, 45000000.00, 'APPROVED', 'HIGH', 
 gen_random_uuid(), '2024-07-13 16:30:00', gen_random_uuid(), '2024-07-14 10:15:00', 
 'Disetujui untuk mengamankan harga bahan baku', NOW(), NOW()),

(gen_random_uuid(), 'ER20240713001', gen_random_uuid(), 'Legal', '2024-07-13', '2024-07-22', 
 'Biaya legal untuk perluasan bisnis ke daerah', 7500000.00, 0.00, 'REJECTED', 'LOW', 
 gen_random_uuid(), '2024-07-16 14:00:00', NULL, NULL, 
 'Ditolak karena rencana ekspansi ditunda', NOW(), NOW()),

(gen_random_uuid(), 'ER20240714001', gen_random_uuid(), 'Admin', '2024-07-14', '2024-07-19', 
 'Renovasi kantor dan furniture baru', 28000000.00, 20000000.00, 'APPROVED', 'NORMAL', 
 gen_random_uuid(), '2024-07-17 09:30:00', gen_random_uuid(), '2024-07-18 12:45:00', 
 'Disetujui dengan penyesuaian scope pekerjaan', NOW(), NOW()),

(gen_random_uuid(), 'ER20240715001', gen_random_uuid(), 'Customer Service', '2024-07-15', '2024-07-24', 
 'Sistem CRM baru dan training customer service', 11000000.00, 0.00, 'PENDING', 'NORMAL', 
 NULL, NULL, NULL, NULL, 
 'Dalam evaluasi ROI oleh tim IT', NOW(), NOW());