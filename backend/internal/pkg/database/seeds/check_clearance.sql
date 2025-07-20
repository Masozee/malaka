-- Check Clearance seed data for Malaka ERP
INSERT INTO check_clearance (
    id, check_number, check_date, bank_name, amount, payee_name,
    account_number, clearance_date, status, memo, cleared_by,
    created_at, updated_at
) VALUES 
-- Outgoing checks (issued by company)
(gen_random_uuid(), 'CHK001', '2024-07-01', 'Bank BCA', 2500000.00, 'PT Sepatu Prima Indonesia',
 '1234567890', '2024-07-05', 'CLEARED', 'Pembayaran pembelian bahan baku sepatu', gen_random_uuid(),
 NOW(), NOW()),

(gen_random_uuid(), 'CHK002', '2024-07-03', 'Bank Mandiri', 3200000.00, 'CV Kulit Berkualitas',
 '2345678901', '2024-07-08', 'CLEARED', 'Pelunasan hutang supplier kulit', gen_random_uuid(),
 NOW(), NOW()),

(gen_random_uuid(), 'CHK003', '2024-07-05', 'Bank BRI', 1800000.00, 'UD Aksesoris Sepatu',
 '3456789012', NULL, 'PRESENTED', 'Pembayaran aksesoris dan sol sepatu', NULL,
 NOW(), NOW()),

(gen_random_uuid(), 'CHK004', '2024-07-08', 'Bank BNI', 4500000.00, 'PT Bahan Kimia Industri',
 '4567890123', NULL, 'ISSUED', 'Pembelian bahan kimia untuk produksi', NULL,
 NOW(), NOW()),

(gen_random_uuid(), 'CHK005', '2024-07-10', 'Bank BCA', 2100000.00, 'CV Transportasi Jaya',
 '5678901234', '2024-07-12', 'BOUNCED', 'Biaya pengiriman barang - cek ditolak bank', NULL,
 NOW(), NOW()),

-- Incoming checks (received by company)
(gen_random_uuid(), 'CHK-IN001', '2024-07-02', 'Bank Central Asia', 5200000.00, 'PT Ramayana Lestari',
 '6789012345', '2024-07-06', 'CLEARED', 'Pembayaran order sepatu formal', gen_random_uuid(),
 NOW(), NOW()),

(gen_random_uuid(), 'CHK-IN002', '2024-07-04', 'Bank Mandiri', 7800000.00, 'PT Matahari Putra Prima',
 '7890123456', '2024-07-09', 'CLEARED', 'Pelunasan pembelian sepatu casual', gen_random_uuid(),
 NOW(), NOW()),

(gen_random_uuid(), 'CHK-IN003', '2024-07-06', 'Bank BRI', 3600000.00, 'CV Sepatu Nusantara',
 '8901234567', NULL, 'PRESENTED', 'Pembayaran pesanan sepatu boots', NULL,
 NOW(), NOW()),

(gen_random_uuid(), 'CHK-IN004', '2024-07-09', 'Bank BNI', 4900000.00, 'UD Toko Sepatu Modern',
 '9012345678', NULL, 'ISSUED', 'Order sepatu untuk toko retail', NULL,
 NOW(), NOW()),

(gen_random_uuid(), 'CHK-IN005', '2024-07-11', 'Bank Permata', 6300000.00, 'PT Distributor Sepatu Asia',
 '0123456789', '2024-07-13', 'BOUNCED', 'Pembayaran pesanan besar - cek kosong', NULL,
 NOW(), NOW()),

(gen_random_uuid(), 'CHK006', '2024-07-12', 'Bank Danamon', 2800000.00, 'PT Mesin Industri Jakarta',
 '1357924680', NULL, 'ISSUED', 'Pembayaran maintenance mesin produksi', NULL,
 NOW(), NOW()),

(gen_random_uuid(), 'CHK-IN006', '2024-07-14', 'Bank CIMB Niaga', 8500000.00, 'PT Ekspor Sepatu Indonesia',
 '2468013579', NULL, 'PRESENTED', 'Pembayaran order ekspor sepatu', NULL,
 NOW(), NOW()),

(gen_random_uuid(), 'CHK007', '2024-07-15', 'Bank BCA', 1950000.00, 'CV Packaging Solutions',
 '3691470258', '2024-07-18', 'CLEARED', 'Pembelian kardus dan kemasan sepatu', gen_random_uuid(),
 NOW(), NOW()),

(gen_random_uuid(), 'CHK-IN007', '2024-07-16', 'Bank Mandiri', 4200000.00, 'UD Sepatu Tradisional',
 '1472583690', '2024-07-20', 'CLEARED', 'Pembayaran sepatu custom handmade', gen_random_uuid(),
 NOW(), NOW()),

(gen_random_uuid(), 'CHK008', '2024-07-18', 'Bank BRI', 3400000.00, 'PT Listrik dan Elektronik',
 '2583691470', NULL, 'CANCELLED', 'Pembayaran instalasi listrik - dibatalkan', NULL,
 NOW(), NOW());