-- POS Transactions seed data for Malaka ERP
-- Uses cashiers from employees table

-- First, insert POS transactions
INSERT INTO pos_transactions (id, transaction_date, total_amount, payment_method, cashier_id, sales_person, customer_name, customer_phone, customer_address, visit_type, location, subtotal, tax_amount, discount_amount, payment_status, delivery_method, delivery_status, commission_rate, commission_amount, notes) VALUES
-- Transaction 1: Cash sale at showroom
('a1111111-1111-1111-1111-111111111111', '2025-01-28 10:30:00+07', 495000.00, 'cash', '44444444-4444-4444-4444-444444444444', 'Indra Kusuma', 'Budi Setiawan', '081234567001', 'Jl. Sudirman No. 100, Jakarta Pusat', 'showroom', 'Showroom Sudirman', 450000.00, 45000.00, 0.00, 'paid', 'pickup', 'delivered', 2.50, 11250.00, 'Pembelian sepatu pantofel untuk acara formal'),

-- Transaction 2: Card payment
('a2222222-2222-2222-2222-222222222222', '2025-01-28 11:15:00+07', 352000.00, 'card', '44444444-4444-4444-4444-444444444444', 'Indra Kusuma', 'Siti Rahayu', '081234567002', 'Jl. Thamrin No. 50, Jakarta Pusat', 'showroom', 'Showroom Sudirman', 320000.00, 32000.00, 0.00, 'paid', 'pickup', 'delivered', 2.50, 8000.00, 'Pembelian sneakers putih'),

-- Transaction 3: Transfer payment - pending
('a3333333-3333-3333-3333-333333333333', '2025-01-28 14:00:00+07', 638000.00, 'transfer', '66666666-6666-6666-6666-666666666666', 'Sari Dewi', 'Ahmad Hidayat', '081234567003', 'Jl. Gatot Subroto No. 200, Jakarta Selatan', 'showroom', 'Showroom Gatot Subroto', 580000.00, 58000.00, 0.00, 'pending', 'delivery', 'pending', 2.00, 11600.00, 'Menunggu konfirmasi transfer BCA'),

-- Transaction 4: Home visit sale
('a4444444-4444-4444-4444-444444444444', '2025-01-28 16:30:00+07', 847000.00, 'cash', '22222222-2222-2222-2222-222222222222', 'Sari Dewi Lestari', 'Dewi Lestari', '081234567004', 'Jl. Kemang Raya No. 88, Jakarta Selatan', 'home_visit', 'Kemang', 770000.00, 77000.00, 0.00, 'paid', 'delivery', 'delivered', 3.00, 23100.00, 'Kunjungan ke rumah pelanggan VIP'),

-- Transaction 5: Exhibition sale with discount
('a5555555-5555-5555-5555-555555555555', '2025-01-29 09:00:00+07', 693000.00, 'card', '44444444-4444-4444-4444-444444444444', 'Indra Kusuma', 'Rudi Hartono', '081234567005', 'Jl. Senayan No. 1, Jakarta Selatan', 'exhibition', 'JCC Senayan', 700000.00, 70000.00, 77000.00, 'paid', 'pickup', 'delivered', 2.50, 17325.00, 'Pameran sepatu Indonesia - diskon 10%'),

-- Transaction 6: Bulk purchase with installment
('a6666666-6666-6666-6666-666666666666', '2025-01-29 11:30:00+07', 2750000.00, 'installment', '22222222-2222-2222-2222-222222222222', 'Sari Dewi Lestari', 'PT Maju Bersama', '021-5551234', 'Jl. Industri No. 45, Tangerang', 'office_visit', 'Kantor PT Maju Bersama', 2500000.00, 250000.00, 0.00, 'partial', 'shipping', 'pending', 3.00, 75000.00, 'Pembelian seragam kantor - cicilan 3 bulan'),

-- Transaction 7: Quick cash sale
('a7777777-7777-7777-7777-777777777777', '2025-01-29 14:45:00+07', 192500.00, 'cash', '66666666-6666-6666-6666-666666666666', 'Indra Kusuma', NULL, NULL, NULL, 'showroom', 'Showroom Sudirman', 175000.00, 17500.00, 0.00, 'paid', 'pickup', 'delivered', 2.00, 3500.00, 'Walk-in customer'),

-- Transaction 8: Card payment with member discount
('a8888888-8888-8888-8888-888888888888', '2025-01-29 16:00:00+07', 381150.00, 'card', '44444444-4444-4444-4444-444444444444', 'Sari Dewi', 'Rina Marlina', '081234567008', 'Jl. Mangga Dua No. 10, Jakarta Utara', 'showroom', 'Showroom Sudirman', 385000.00, 38500.00, 42350.00, 'paid', 'pickup', 'delivered', 2.50, 9528.75, 'Member Gold - diskon 10%'),

-- Transaction 9: Today morning sale
('a9999999-9999-9999-9999-999999999999', '2025-01-30 09:30:00+07', 550000.00, 'cash', '44444444-4444-4444-4444-444444444444', 'Indra Kusuma', 'Fajar Nugroho', '081234567009', 'Jl. Kebon Sirih No. 5, Jakarta Pusat', 'showroom', 'Showroom Sudirman', 500000.00, 50000.00, 0.00, 'paid', 'pickup', 'delivered', 2.50, 12500.00, 'Pembelian pagi hari'),

-- Transaction 10: Today pending transfer
('b0000000-0000-0000-0000-000000000000', '2025-01-30 10:15:00+07', 825000.00, 'transfer', '66666666-6666-6666-6666-666666666666', 'Sari Dewi', 'Lisa Permata', '081234567010', 'Jl. Sudirman No. 200, Jakarta Pusat', 'showroom', 'Showroom Gatot Subroto', 750000.00, 75000.00, 0.00, 'pending', 'delivery', 'pending', 2.00, 15000.00, 'Transfer Mandiri - menunggu konfirmasi')
ON CONFLICT (id) DO NOTHING;

-- Insert POS items (line items for each transaction)
INSERT INTO pos_items (id, pos_transaction_id, article_id, product_code, product_name, size, color, quantity, unit_price, discount_percentage, line_total) VALUES
-- Items for Transaction 1
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', NULL, 'PNTFL-BLK-42', 'Sepatu Pantofel Kulit Hitam', '42', 'Hitam', 1, 450000.00, 0.00, 450000.00),

-- Items for Transaction 2
('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', NULL, 'SNKRS-WHT-41', 'Sepatu Sneakers Casual Putih', '41', 'Putih', 1, 320000.00, 0.00, 320000.00),

-- Items for Transaction 3
('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', NULL, 'BOOTS-BRN-43', 'Sepatu Boots Kerja Safety', '43', 'Coklat', 1, 580000.00, 0.00, 580000.00),

-- Items for Transaction 4 (multiple items)
('b4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', NULL, 'PNTFL-BLK-42', 'Sepatu Pantofel Kulit Hitam', '42', 'Hitam', 1, 450000.00, 0.00, 450000.00),
('b4444444-4444-4444-4444-444444444445', 'a4444444-4444-4444-4444-444444444444', NULL, 'SNKRS-WHT-40', 'Sepatu Sneakers Casual Putih', '40', 'Putih', 1, 320000.00, 0.00, 320000.00),

-- Items for Transaction 5 (with discount)
('b5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', NULL, 'BOOTS-BRN-42', 'Sepatu Boots Kerja Safety', '42', 'Coklat', 1, 580000.00, 10.00, 522000.00),
('b5555555-5555-5555-5555-555555555556', 'a5555555-5555-5555-5555-555555555555', NULL, 'SNDL-BRN-40', 'Sepatu Sandal Pria', '40', 'Coklat', 1, 175000.00, 0.00, 175000.00),

-- Items for Transaction 6 (bulk purchase)
('b6666666-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', NULL, 'PNTFL-BLK-40', 'Sepatu Pantofel Kulit Hitam', '40', 'Hitam', 2, 450000.00, 0.00, 900000.00),
('b6666666-6666-6666-6666-666666666667', 'a6666666-6666-6666-6666-666666666666', NULL, 'PNTFL-BLK-41', 'Sepatu Pantofel Kulit Hitam', '41', 'Hitam', 2, 450000.00, 0.00, 900000.00),
('b6666666-6666-6666-6666-666666666668', 'a6666666-6666-6666-6666-666666666666', NULL, 'PNTFL-BLK-42', 'Sepatu Pantofel Kulit Hitam', '42', 'Hitam', 1, 450000.00, 0.00, 450000.00),
('b6666666-6666-6666-6666-666666666669', 'a6666666-6666-6666-6666-666666666666', NULL, 'SNDL-BRN-42', 'Sepatu Sandal Pria', '42', 'Coklat', 2, 175000.00, 0.00, 350000.00),

-- Items for Transaction 7
('b7777777-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', NULL, 'SNDL-BRN-41', 'Sepatu Sandal Pria', '41', 'Coklat', 1, 175000.00, 0.00, 175000.00),

-- Items for Transaction 8 (member discount)
('b8888888-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', NULL, 'HEEL-BLK-37', 'Sepatu Wanita Hak Tinggi', '37', 'Hitam', 1, 385000.00, 10.00, 346500.00),

-- Items for Transaction 9
('b9999999-9999-9999-9999-999999999999', 'a9999999-9999-9999-9999-999999999999', NULL, 'PNTFL-BLK-43', 'Sepatu Pantofel Kulit Hitam', '43', 'Hitam', 1, 450000.00, 0.00, 450000.00),

-- Items for Transaction 10 (2 items)
('c0000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000000', NULL, 'SNKRS-WHT-38', 'Sepatu Sneakers Casual Putih', '38', 'Putih', 1, 320000.00, 0.00, 320000.00),
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000000', NULL, 'HEEL-BLK-38', 'Sepatu Wanita Hak Tinggi', '38', 'Hitam', 1, 385000.00, 0.00, 385000.00)
ON CONFLICT (id) DO NOTHING;
