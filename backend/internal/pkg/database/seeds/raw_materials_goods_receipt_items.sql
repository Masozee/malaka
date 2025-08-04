-- Goods Receipt Items for Raw Materials
-- These represent the actual raw material items received

INSERT INTO goods_receipt_items (
    goods_receipt_id,
    article_id,
    quantity
) VALUES

-- Items for CV Kulit Jaya leather receipt
(
    (SELECT id FROM goods_receipts WHERE purchase_order_id = (SELECT id FROM purchase_orders WHERE supplier_id = '6d1ec8e0-3d38-42db-988b-8a253d0de747' AND total_amount = 12550000.00)),
    (SELECT id FROM articles WHERE barcode = 'RAW001'), -- Kulit Sapi Grade A
    100 -- 100 square meters received
),
(
    (SELECT id FROM goods_receipts WHERE purchase_order_id = (SELECT id FROM purchase_orders WHERE supplier_id = '6d1ec8e0-3d38-42db-988b-8a253d0de747' AND total_amount = 12550000.00)),
    (SELECT id FROM articles WHERE barcode = 'RAW002'), -- Kulit Kambing Lembut
    60 -- 60 square meters received
),
(
    (SELECT id FROM goods_receipts WHERE purchase_order_id = (SELECT id FROM purchase_orders WHERE supplier_id = '6d1ec8e0-3d38-42db-988b-8a253d0de747' AND total_amount = 12550000.00)),
    (SELECT id FROM articles WHERE barcode = 'RAW009'), -- Cairan Pembersih
    10 -- 10 liters received
),

-- Items for UD Footwear Prima rubber receipt
(
    (SELECT id FROM goods_receipts WHERE purchase_order_id = (SELECT id FROM purchase_orders WHERE supplier_id = '04505b14-da85-4d71-a42f-1187dbb6fbf8' AND total_amount = 10850000.00)),
    (SELECT id FROM articles WHERE barcode = 'RAW003'), -- Kulit Sintetis
    150 -- 150 square meters received
),
(
    (SELECT id FROM goods_receipts WHERE purchase_order_id = (SELECT id FROM purchase_orders WHERE supplier_id = '04505b14-da85-4d71-a42f-1187dbb6fbf8' AND total_amount = 10850000.00)),
    (SELECT id FROM articles WHERE barcode = 'RAW004'), -- Karet Sol Mentah
    80 -- 80 kg received
),
(
    (SELECT id FROM goods_receipts WHERE purchase_order_id = (SELECT id FROM purchase_orders WHERE supplier_id = '04505b14-da85-4d71-a42f-1187dbb6fbf8' AND total_amount = 10850000.00)),
    (SELECT id FROM articles WHERE barcode = 'RAW005'), -- Karet EVA Foam
    200 -- 200 sheets received
),

-- Items for PT Sepatu Indah fabric receipt
(
    (SELECT id FROM goods_receipts WHERE purchase_order_id = (SELECT id FROM purchase_orders WHERE supplier_id = 'fb637676-bc29-48c8-82a8-dfe09790d520' AND total_amount = 6005000.00)),
    (SELECT id FROM articles WHERE barcode = 'RAW006'), -- Kain Canvas
    120 -- 120 meters received
),
(
    (SELECT id FROM goods_receipts WHERE purchase_order_id = (SELECT id FROM purchase_orders WHERE supplier_id = 'fb637676-bc29-48c8-82a8-dfe09790d520' AND total_amount = 6005000.00)),
    (SELECT id FROM articles WHERE barcode = 'RAW007'), -- Kain Mesh
    80 -- 80 meters received
),
(
    (SELECT id FROM goods_receipts WHERE purchase_order_id = (SELECT id FROM purchase_orders WHERE supplier_id = 'fb637676-bc29-48c8-82a8-dfe09790d520' AND total_amount = 6005000.00)),
    (SELECT id FROM articles WHERE barcode = 'RAW008'), -- Lem Sepatu PU
    25 -- 25 liters received
);