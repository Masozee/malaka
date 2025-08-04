-- Realistic Purchase Order Items Seed Data with proper pricing constraints
-- Creating purchase order items that fit within database constraints (max 99,999,999.99)

-- Clear existing purchase order items first
DELETE FROM purchase_order_items;

-- Items for approved purchase orders with realistic Indonesian pricing
-- Using smaller quantities and prices to fit database constraints
INSERT INTO purchase_order_items (
    purchase_order_id,
    article_id,
    quantity,
    unit_price,
    total_price
) VALUES

-- Items for 1st approved PO (Nike Air Max products)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1),
    'b08eabad-f773-4778-9228-1fbc7f3efc0a', -- Nike Air Max 39
    25,
    450000.00,
    11250000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1),
    'fb15f470-92ca-40f1-b355-a3099ca4b453', -- Nike Air Max 40
    15,
    450000.00,
    6750000.00
),

-- Items for 2nd approved PO (Casual Walker products)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 1),
    '73890d67-5af6-4ccd-974e-cb62772806ea', -- Casual Walker 39
    30,
    320000.00,
    9600000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 1),
    '9102826a-aac0-416f-9663-369e4e6df0a7', -- Casual Walker 40
    20,
    320000.00,
    6400000.00
),

-- Items for 3rd approved PO (Business Formal products)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 2),
    'dbfd3ed1-52e2-4a9e-8d2c-16253298e51d', -- Business Formal 40
    15,
    580000.00,
    8700000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 2),
    '6582a911-b824-4454-a414-2a4b3827af79', -- Business Formal 41
    10,
    580000.00,
    5800000.00
),

-- Items for 4th approved PO (Mixed Casual Walker)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 3),
    '2ee7831f-0b9d-4d66-b0d5-424b82672b86', -- Casual Walker 41
    25,
    320000.00,
    8000000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 3),
    'dc01ec63-68d7-4607-aad4-66d4e21bea05', -- Casual Walker 42
    20,
    320000.00,
    6400000.00
),

-- Items for 5th approved PO (Nike products)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 4),
    '75096aa1-ef4c-44e0-bc40-62224c26bdb0', -- Nike Air Max 39
    30,
    450000.00,
    13500000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 4),
    'fb15f470-92ca-40f1-b355-a3099ca4b453', -- Nike Air Max 40
    20,
    450000.00,
    9000000.00
),

-- Items for 6th approved PO (Business Formal)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 5),
    'dbfd3ed1-52e2-4a9e-8d2c-16253298e51d', -- Business Formal 40
    12,
    580000.00,
    6960000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 5),
    '6582a911-b824-4454-a414-2a4b3827af79', -- Business Formal 41
    15,
    580000.00,
    8700000.00
),

-- Items for 7th approved PO (Casual products)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 6),
    '73890d67-5af6-4ccd-974e-cb62772806ea', -- Casual Walker 39
    35,
    320000.00,
    11200000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 6),
    '9102826a-aac0-416f-9663-369e4e6df0a7', -- Casual Walker 40
    25,
    320000.00,
    8000000.00
),

-- Items for 8th approved PO (Nike products)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 7),
    'b08eabad-f773-4778-9228-1fbc7f3efc0a', -- Nike Air Max 39
    20,
    450000.00,
    9000000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 7),
    'fbfdbf4e-ae22-4eb5-a4d5-9d7210bdf7c3', -- Nike Air Max 43
    18,
    450000.00,
    8100000.00
),

-- Items for 9th approved PO (Casual Walker)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 8),
    '2ee7831f-0b9d-4d66-b0d5-424b82672b86', -- Casual Walker 41
    30,
    320000.00,
    9600000.00
);