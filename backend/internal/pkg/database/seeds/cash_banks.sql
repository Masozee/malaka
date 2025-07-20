-- Cash/Bank Master Data - Indonesian Localized Content
-- Bank accounts and cash accounts for Indonesian ERP system

INSERT INTO cash_banks (account_name, account_type, account_number, bank_name, branch, currency, opening_balance, current_balance, is_active, description) VALUES
('Kas Utama Kantor Pusat', 'CASH', 'CASH001', '', '', 'IDR', 25000000.00, 25000000.00, true, 'Kas utama untuk operasional harian kantor pusat Jakarta'),
('Kas Toko Bandung', 'CASH', 'CASH002', '', '', 'IDR', 10000000.00, 10000000.00, true, 'Kas untuk operasional toko Bandung'),
('Bank Mandiri Jakarta Pusat', 'BANK', '1370013888899', 'Bank Mandiri', 'Jakarta Pusat', 'IDR', 150000000.00, 150000000.00, true, 'Rekening utama perusahaan di Bank Mandiri'),
('Bank BCA Sudirman', 'BANK', '2871234567', 'Bank Central Asia', 'Sudirman', 'IDR', 75000000.00, 75000000.00, true, 'Rekening operasional BCA untuk transaksi harian'),
('Bank BNI Senayan', 'BANK', '0456789012', 'Bank Negara Indonesia', 'Senayan', 'IDR', 50000000.00, 50000000.00, true, 'Rekening payroll karyawan BNI'),
('Bank BRI Thamrin', 'BANK', '0345678901234', 'Bank Rakyat Indonesia', 'Thamrin', 'IDR', 30000000.00, 30000000.00, true, 'Rekening untuk pembayaran supplier'),
('Kas Toko Surabaya', 'CASH', 'CASH003', '', '', 'IDR', 8000000.00, 8000000.00, true, 'Kas untuk operasional toko Surabaya'),
('Bank CIMB Niaga Kuningan', 'BANK', '7001234567890', 'CIMB Niaga', 'Kuningan', 'IDR', 25000000.00, 25000000.00, true, 'Rekening investasi dan deposito'),
('Kas Toko Medan', 'CASH', 'CASH004', '', '', 'IDR', 6000000.00, 6000000.00, true, 'Kas untuk operasional toko Medan'),
('Bank Danamon Plaza Indonesia', 'BANK', '0034567890123', 'Bank Danamon', 'Plaza Indonesia', 'IDR', 40000000.00, 40000000.00, true, 'Rekening untuk ekspor impor'),
('Kas Petty Cash HR', 'CASH', 'CASH005', '', '', 'IDR', 2000000.00, 2000000.00, true, 'Petty cash untuk keperluan HR dan administrasi'),
('Bank Permata Senopati', 'BANK', '0123456789012', 'Bank Permata', 'Senopati', 'IDR', 35000000.00, 35000000.00, true, 'Rekening untuk pembayaran utilitas dan operasional'),
('Bank OCBC NISP Kemang', 'BANK', '5567890123456', 'Bank OCBC NISP', 'Kemang', 'IDR', 20000000.00, 20000000.00, true, 'Rekening cadangan untuk emergency fund'),
('Kas Toko Yogyakarta', 'CASH', 'CASH006', '', '', 'IDR', 5000000.00, 5000000.00, true, 'Kas untuk operasional toko Yogyakarta'),
('Bank BTN Kelapa Gading', 'BANK', '0234567890123', 'Bank Tabungan Negara', 'Kelapa Gading', 'IDR', 15000000.00, 15000000.00, true, 'Rekening untuk proyek dan investasi properti');