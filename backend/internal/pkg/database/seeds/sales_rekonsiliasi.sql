-- Indonesian Sales Rekonsiliasi Seed Data
INSERT INTO sales_rekonsiliasi (reconciliation_date, sales_amount, payment_amount, discrepancy, status, notes) VALUES
(gen_random_uuid(), '2024-01-05 09:00:00+07', 15000000, 14950000, 50000, 'Pending', 'Selisih kecil, perlu verifikasi manual'),
(gen_random_uuid(), '2024-01-06 10:00:00+07', 25000000, 25000000, 0, 'Reconciled', 'Rekonsiliasi penjualan harian selesai'),
(gen_random_uuid(), '2024-01-07 11:00:00+07', 18000000, 17500000, 500000, 'Disputed', 'Selisih besar, kemungkinan ada transaksi belum tercatat'),
(gen_random_uuid(), '2024-01-08 09:30:00+07', 30000000, 30000000, 0, 'Reconciled', 'Rekonsiliasi penjualan online'),
(gen_random_uuid(), '2024-01-09 14:00:00+07', 12000000, 11900000, 100000, 'Pending', 'Ada diskon yang belum tercatat di sistem'),
(gen_random_uuid(), '2024-01-10 10:00:00+07', 22000000, 22000000, 0, 'Reconciled', 'Rekonsiliasi mingguan selesai'),
(gen_random_uuid(), '2024-01-11 11:00:00+07', 17500000, 17450000, 50000, 'Pending', 'Perlu cek ulang data dari POS'),
(gen_random_uuid(), '2024-01-12 13:00:00+07', 28000000, 27800000, 200000, 'Disputed', 'Ada return barang yang belum diproses'),
(gen_random_uuid(), '2024-01-13 09:00:00+07', 19500000, 19500000, 0, 'Reconciled', 'Rekonsiliasi akhir pekan'),
(gen_random_uuid(), '2024-01-14 10:00:00+07', 35000000, 34900000, 100000, 'Pending', 'Selisih dari pembayaran kartu kredit');