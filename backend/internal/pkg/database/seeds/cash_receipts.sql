-- Cash Receipts - Indonesian Business Income Transactions
-- Cash and bank receipts from various sources

INSERT INTO cash_receipts (receipt_number, receipt_date, cash_bank_id, received_from, amount, currency, reference_number, reference_type, description, receipt_method, received_by) VALUES
-- Customer payments
('CR-20250115-001', '2025-01-15', '550e8400-e29b-41d4-a716-446655440003', 'Toko Sepatu Merdeka Jakarta', 25000000.00, 'IDR', 'SO-20250115-001', 'SALES_PAYMENT', 'Pembayaran DP 50% untuk pesanan sepatu formal dan kasual', 'BANK_TRANSFER', 'finance_jakarta', '2025-01-15 14:30:00', '2025-01-15 14:30:00'),
('CR-20250116-001', '2025-01-16', '550e8400-e29b-41d4-a716-446655440004', 'CV Perdagangan Sepatu Bandung', 14700000.00, 'IDR', 'SO-20250116-002', 'SALES_PAYMENT', 'Pembayaran cicilan pertama untuk sepatu safety dan boots', 'BANK_TRANSFER', 'finance_bandung', '2025-01-16 11:45:00', '2025-01-16 11:45:00'),
('CR-20250117-001', '2025-01-17', '550e8400-e29b-41d4-a716-446655440002', 'Ahmad Hidayat', 1200000.00, 'IDR', 'POS-20250117-001', 'CASH_SALE', 'Pembayaran tunai pembelian sepatu sneakers di toko Bandung', 'CASH', 'cashier_bandung', '2025-01-17 16:30:00', '2025-01-17 16:30:00'),
('CR-20250118-001', '2025-01-18', '550e8400-e29b-41d4-a716-446655440003', 'PT Retail Nusantara', 22680000.00, 'IDR', 'SO-20250117-003', 'ADVANCE_PAYMENT', 'Pembayaran uang muka 30% untuk pesanan custom sepatu', 'BANK_TRANSFER', 'finance_jakarta', '2025-01-18 09:15:00', '2025-01-18 09:15:00'),

-- Export receipts
('CR-20250119-001', '2025-01-19', '550e8400-e29b-41d4-a716-446655440010', 'Malaysia Shoe Trading Sdn Bhd', 24225000.00, 'IDR', 'EX-20250125-011', 'EXPORT_ADVANCE', 'Pembayaran advance 30% untuk export ke Malaysia', 'WIRE_TRANSFER', 'export_finance', '2025-01-19 10:20:00', '2025-01-19 10:20:00'),
('CR-20250120-001', '2025-01-20', '550e8400-e29b-41d4-a716-446655440010', 'Singapore Footwear Pte Ltd', 34200000.00, 'IDR', 'EX-20250126-012', 'EXPORT_PAYMENT', 'Pembayaran partial untuk bulk order sepatu olahraga', 'SWIFT_TRANSFER', 'export_finance', '2025-01-20 13:45:00', '2025-01-20 13:45:00'),

-- Corporate and wholesale receipts
('CR-20250121-001', '2025-01-21', '550e8400-e29b-41d4-a716-446655440005', 'PT Distributor Sepatu Indonesia', 48000000.00, 'IDR', 'SO-20250119-005', 'WHOLESALE_PAYMENT', 'Pembayaran 40% untuk penjualan grosir wilayah Jabodetabek', 'BANK_TRANSFER', 'finance_wholesale', '2025-01-21 15:30:00', '2025-01-21 15:30:00'),
('CR-20250122-001', '2025-01-22', '550e8400-e29b-41d4-a716-446655440006', 'PT Sepatu Modern Medan', 32625000.00, 'IDR', 'SO-20250121-007', 'WHOLESALE_PAYMENT', 'Pembayaran 50% untuk sepatu branded market Sumatera', 'BANK_TRANSFER', 'finance_medan', '2025-01-22 12:00:00', '2025-01-22 12:00:00'),
('CR-20250123-001', '2025-01-23', '550e8400-e29b-41d4-a716-446655440003', 'PT Keamanan Terpadu', 24250000.00, 'IDR', 'SO-20250124-010', 'CORPORATE_PAYMENT', 'Pembayaran 50% untuk sepatu dinas security', 'BANK_TRANSFER', 'finance_corporate', '2025-01-23 14:15:00', '2025-01-23 14:15:00'),

-- Online marketplace receipts
('CR-20250124-001', '2025-01-24', '550e8400-e29b-41d4-a716-446655440004', 'Shopee Indonesia', 9250000.00, 'IDR', 'MP-20250131-017', 'MARKETPLACE_SETTLEMENT', 'Settlement penjualan Shopee periode 15-31 Januari', 'AUTO_TRANSFER', 'marketplace_system', '2025-01-24 16:45:00', '2025-01-24 16:45:00'),
('CR-20250125-001', '2025-01-25', '550e8400-e29b-41d4-a716-446655440004', 'Tokopedia Marketplace', 15480000.00, 'IDR', 'MP-20250130-016', 'MARKETPLACE_PAYMENT', 'Pembayaran partial dari penjualan Tokopedia', 'AUTO_TRANSFER', 'marketplace_system', '2025-01-25 11:30:00', '2025-01-25 11:30:00'),

-- Cash sales at retail stores
('CR-20250126-001', '2025-01-26', '550e8400-e29b-41d4-a716-446655440002', 'Walk-in Customer', 2850000.00, 'IDR', 'POS-20250126-001', 'RETAIL_CASH', 'Penjualan tunai sepatu formal di toko Bandung', 'CASH', 'cashier_bandung', '2025-01-26 18:30:00', '2025-01-26 18:30:00'),
('CR-20250127-001', '2025-01-27', '550e8400-e29b-41d4-a716-446655440007', 'Walk-in Customer', 1950000.00, 'IDR', 'POS-20250127-001', 'RETAIL_CASH', 'Penjualan tunai sepatu casual di toko Surabaya', 'CASH', 'cashier_surabaya', '2025-01-27 17:15:00', '2025-01-27 17:15:00'),
('CR-20250128-001', '2025-01-28', '550e8400-e29b-41d4-a716-446655440009', 'Walk-in Customer', 1560000.00, 'IDR', 'POS-20250128-001', 'RETAIL_CASH', 'Penjualan tunai sepatu anak di toko Medan', 'CASH', 'cashier_medan', '2025-01-28 19:00:00', '2025-01-28 19:00:00'),
('CR-20250129-001', '2025-01-29', '550e8400-e29b-41d4-a716-446655440014', 'Walk-in Customer', 1680000.00, 'IDR', 'POS-20250129-001', 'RETAIL_CASH', 'Penjualan tunai sepatu tradisional di toko Yogyakarta', 'CASH', 'cashier_yogya', '2025-01-29 16:45:00', '2025-01-29 16:45:00'),

-- Returns and refunds (negative receipts)
('CR-20250130-001', '2025-01-30', '550e8400-e29b-41d4-a716-446655440003', 'CV Pembeli Kecewa', -2400000.00, 'IDR', 'REF-20250130-001', 'CUSTOMER_REFUND', 'Pengembalian dana untuk barang yang rusak', 'BANK_TRANSFER', 'customer_service', '2025-01-30 10:20:00', '2025-01-30 10:20:00'),

-- Bank interest and investment income
('CR-20250131-001', '2025-01-31', '550e8400-e29b-41d4-a716-446655440003', 'Bank Mandiri Jakarta Pusat', 2250000.00, 'IDR', 'INT-202501-001', 'BANK_INTEREST', 'Bunga deposito bulan Januari 2025', 'AUTO_CREDIT', 'bank_system', '2025-01-31 23:59:00', '2025-01-31 23:59:00'),
('CR-20250131-002', '2025-01-31', '550e8400-e29b-41d4-a716-446655440008', 'CIMB Niaga Kuningan', 1875000.00, 'IDR', 'DIV-202501-001', 'INVESTMENT_DIVIDEND', 'Dividen dari investasi reksadana', 'AUTO_CREDIT', 'investment_system', '2025-01-31 23:58:00', '2025-01-31 23:58:00'),

-- Government tax refunds
('CR-20250201-001', '2025-02-01', '550e8400-e29b-41d4-a716-446655440003', 'Kantor Pajak Jakarta Pusat', 5500000.00, 'IDR', 'TAX-REF-202501', 'TAX_REFUND', 'Restitusi pajak penghasilan lebih bayar tahun 2024', 'GIRO_TRANSFER', 'tax_office', '2025-02-01 14:30:00', '2025-02-01 14:30:00'),

-- Miscellaneous income
('CR-20250202-001', '2025-02-02', '550e8400-e29b-41d4-a716-446655440003', 'PT Asuransi Klaim', 8750000.00, 'IDR', 'CLAIM-202501-001', 'INSURANCE_CLAIM', 'Klaim asuransi untuk kerusakan mesin produksi', 'BANK_TRANSFER', 'insurance_company', '2025-02-02 11:15:00', '2025-02-02 11:15:00');