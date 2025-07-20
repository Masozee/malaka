-- Purchase Vouchers seed data for Malaka ERP
INSERT INTO purchase_vouchers (
    id, voucher_number, supplier_id, voucher_date, due_date, total_amount, 
    paid_amount, remaining_amount, discount_amount, tax_amount, description, 
    status, approved_by, approved_at, created_at, updated_at
) VALUES 
(gen_random_uuid(), 'PV20240701001', gen_random_uuid(), '2024-07-01', '2024-07-31', 25000000.00, 
 15000000.00, 10000000.00, 500000.00, 2500000.00, 'Pembelian sepatu kulit formal dari PT Sepatu Indonesia', 
 'PARTIAL', gen_random_uuid(), '2024-07-15 10:00:00', NOW(), NOW()),

(gen_random_uuid(), 'PV20240702001', gen_random_uuid(), '2024-07-02', '2024-08-01', 18000000.00, 
 18000000.00, 0.00, 300000.00, 1800000.00, 'Pembelian sandal casual dari CV Sandal Nusantara', 
 'PAID', gen_random_uuid(), '2024-07-10 14:30:00', NOW(), NOW()),

(gen_random_uuid(), 'PV20240703001', gen_random_uuid(), '2024-07-03', '2024-08-02', 32000000.00, 
 0.00, 32000000.00, 800000.00, 3200000.00, 'Pembelian bahan baku kulit dari UD Kulit Jaya', 
 'PENDING', NULL, NULL, NOW(), NOW()),

(gen_random_uuid(), 'PV20240704001', gen_random_uuid(), '2024-07-04', '2024-08-03', 22000000.00, 
 11000000.00, 11000000.00, 400000.00, 2200000.00, 'Pembelian sepatu olahraga dari PT Sport Gear', 
 'PARTIAL', gen_random_uuid(), '2024-07-18 09:15:00', NOW(), NOW()),

(gen_random_uuid(), 'PV20240705001', gen_random_uuid(), '2024-07-05', '2024-08-04', 28000000.00, 
 28000000.00, 0.00, 600000.00, 2800000.00, 'Pembelian sandal kulit dari CV Premium Leather', 
 'PAID', gen_random_uuid(), '2024-07-12 16:45:00', NOW(), NOW()),

(gen_random_uuid(), 'PV20240706001', gen_random_uuid(), '2024-07-06', '2024-08-05', 15000000.00, 
 7500000.00, 7500000.00, 250000.00, 1500000.00, 'Pembelian aksesoris sepatu dari UD Aksesoris Jaya', 
 'PARTIAL', gen_random_uuid(), '2024-07-20 11:20:00', NOW(), NOW()),

(gen_random_uuid(), 'PV20240707001', gen_random_uuid(), '2024-07-07', '2024-08-06', 35000000.00, 
 0.00, 35000000.00, 700000.00, 3500000.00, 'Pembelian sepatu formal premium dari PT Elite Shoes', 
 'PENDING', NULL, NULL, NOW(), NOW()),

(gen_random_uuid(), 'PV20240708001', gen_random_uuid(), '2024-07-08', '2024-08-07', 20000000.00, 
 20000000.00, 0.00, 400000.00, 2000000.00, 'Pembelian sandal anak-anak dari CV Kids Fashion', 
 'PAID', gen_random_uuid(), '2024-07-14 13:30:00', NOW(), NOW()),

(gen_random_uuid(), 'PV20240709001', gen_random_uuid(), '2024-07-09', '2024-08-08', 26000000.00, 
 13000000.00, 13000000.00, 520000.00, 2600000.00, 'Pembelian sol sepatu dari PT Sole Technology', 
 'PARTIAL', gen_random_uuid(), '2024-07-16 15:10:00', NOW(), NOW()),

(gen_random_uuid(), 'PV20240710001', gen_random_uuid(), '2024-07-10', '2024-08-09', 42000000.00, 
 0.00, 42000000.00, 840000.00, 4200000.00, 'Pembelian sepatu boots safety dari CV Safety Equipment', 
 'PENDING', NULL, NULL, NOW(), NOW()),

(gen_random_uuid(), 'PV20240711001', gen_random_uuid(), '2024-07-11', '2024-08-10', 19500000.00, 
 19500000.00, 0.00, 350000.00, 1950000.00, 'Pembelian sepatu casual dari UD Fashion Shoes', 
 'PAID', gen_random_uuid(), '2024-07-17 12:45:00', NOW(), NOW()),

(gen_random_uuid(), 'PV20240712001', gen_random_uuid(), '2024-07-12', '2024-08-11', 31000000.00, 
 15500000.00, 15500000.00, 620000.00, 3100000.00, 'Pembelian sepatu pantofel dari PT Formal Wear', 
 'PARTIAL', gen_random_uuid(), '2024-07-19 08:30:00', NOW(), NOW()),

(gen_random_uuid(), 'PV20240713001', gen_random_uuid(), '2024-07-13', '2024-08-12', 24000000.00, 
 0.00, 24000000.00, 480000.00, 2400000.00, 'Pembelian bahan pewarna kulit dari CV Chemical Supply', 
 'PENDING', NULL, NULL, NOW(), NOW()),

(gen_random_uuid(), 'PV20240714001', gen_random_uuid(), '2024-07-14', '2024-08-13', 37000000.00, 
 37000000.00, 0.00, 740000.00, 3700000.00, 'Pembelian sepatu wanita dari PT Ladies Fashion', 
 'PAID', gen_random_uuid(), '2024-07-21 10:15:00', NOW(), NOW()),

(gen_random_uuid(), 'PV20240715001', gen_random_uuid(), '2024-07-15', '2024-08-14', 29000000.00, 
 14500000.00, 14500000.00, 580000.00, 2900000.00, 'Pembelian sepatu anak dari UD Children Shoes', 
 'PARTIAL', gen_random_uuid(), '2024-07-22 14:20:00', NOW(), NOW());