-- Goods Receipts for Raw Materials
-- These represent incoming raw materials from suppliers

INSERT INTO goods_receipts (
    purchase_order_id,
    receipt_date,
    warehouse_id
) VALUES

-- Receipt for leather materials from CV Kulit Jaya
(
    (SELECT id FROM purchase_orders WHERE supplier_id = '6d1ec8e0-3d38-42db-988b-8a253d0de747' AND total_amount = 12550000.00),
    '2025-01-27 14:30:00+07:00',
    '54b86dd3-9810-4077-b98b-2cf6ca962b6f' -- Jakarta Central Warehouse
),

-- Receipt for rubber materials from UD Footwear Prima
(
    (SELECT id FROM purchase_orders WHERE supplier_id = '04505b14-da85-4d71-a42f-1187dbb6fbf8' AND total_amount = 10850000.00),
    '2025-01-28 10:15:00+07:00',
    '3fdd1835-82e6-4858-83f0-95b4e6ce0935' -- Surabaya Distribution Center
),

-- Receipt for fabric materials from PT Sepatu Indah
(
    (SELECT id FROM purchase_orders WHERE supplier_id = 'fb637676-bc29-48c8-82a8-dfe09790d520' AND total_amount = 6005000.00),
    '2025-01-29 11:45:00+07:00',
    'cb63d830-0b26-4d12-ae5a-c68eef7f6af6' -- Bandung Storage Facility
);