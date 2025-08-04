-- Purchase Order Items for Raw Materials (Fixed)
-- Realistic quantities and pricing for manufacturing operations

INSERT INTO purchase_order_items (
    purchase_order_id,
    article_id,
    quantity,
    unit_price,
    total_price
) VALUES

-- Items for CV Kulit Jaya order (leather materials)
(
    (SELECT id FROM purchase_orders WHERE supplier_id = '6d1ec8e0-3d38-42db-988b-8a253d0de747' AND total_amount = 12550000.00),
    (SELECT id FROM articles WHERE barcode = 'RAW001'), -- Kulit Sapi Grade A
    100, -- 100 square meters
    85000.00,
    8500000.00
),
(
    (SELECT id FROM purchase_orders WHERE supplier_id = '6d1ec8e0-3d38-42db-988b-8a253d0de747' AND total_amount = 12550000.00),
    (SELECT id FROM articles WHERE barcode = 'RAW002'), -- Kulit Kambing Lembut
    60, -- 60 square meters
    65000.00,
    3900000.00
),
(
    (SELECT id FROM purchase_orders WHERE supplier_id = '6d1ec8e0-3d38-42db-988b-8a253d0de747' AND total_amount = 12550000.00),
    (SELECT id FROM articles WHERE barcode = 'RAW009'), -- Cairan Pembersih
    10, -- 10 liters
    15000.00,
    150000.00
),

-- Items for UD Footwear Prima order (rubber and synthetic materials)
(
    (SELECT id FROM purchase_orders WHERE supplier_id = '04505b14-da85-4d71-a42f-1187dbb6fbf8' AND total_amount = 10850000.00),
    (SELECT id FROM articles WHERE barcode = 'RAW003'), -- Kulit Sintetis
    150, -- 150 square meters
    35000.00,
    5250000.00
),
(
    (SELECT id FROM purchase_orders WHERE supplier_id = '04505b14-da85-4d71-a42f-1187dbb6fbf8' AND total_amount = 10850000.00),
    (SELECT id FROM articles WHERE barcode = 'RAW004'), -- Karet Sol Mentah
    80, -- 80 kg
    25000.00,
    2000000.00
),
(
    (SELECT id FROM purchase_orders WHERE supplier_id = '04505b14-da85-4d71-a42f-1187dbb6fbf8' AND total_amount = 10850000.00),
    (SELECT id FROM articles WHERE barcode = 'RAW005'), -- Karet EVA Foam
    200, -- 200 sheets
    18000.00,
    3600000.00
),

-- Items for PT Sepatu Indah order (fabric and adhesive materials)
(
    (SELECT id FROM purchase_orders WHERE supplier_id = 'fb637676-bc29-48c8-82a8-dfe09790d520' AND total_amount = 6005000.00),
    (SELECT id FROM articles WHERE barcode = 'RAW006'), -- Kain Canvas
    120, -- 120 meters
    22000.00,
    2640000.00
),
(
    (SELECT id FROM purchase_orders WHERE supplier_id = 'fb637676-bc29-48c8-82a8-dfe09790d520' AND total_amount = 6005000.00),
    (SELECT id FROM articles WHERE barcode = 'RAW007'), -- Kain Mesh
    80, -- 80 meters
    28000.00,
    2240000.00
),
(
    (SELECT id FROM purchase_orders WHERE supplier_id = 'fb637676-bc29-48c8-82a8-dfe09790d520' AND total_amount = 6005000.00),
    (SELECT id FROM articles WHERE barcode = 'RAW008'), -- Lem Sepatu PU
    25, -- 25 liters
    45000.00,
    1125000.00
);