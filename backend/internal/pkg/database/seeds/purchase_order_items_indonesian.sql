-- Indonesian Purchase Order Items Seed Data
-- Items for each purchase order with realistic Indonesian shoe products

INSERT INTO purchase_order_items (
    purchase_order_id,
    article_id,
    quantity,
    unit_price,
    total_price
) VALUES
-- Items for first few purchase orders with Nike products
(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1),
    'b08eabad-f773-4778-9228-1fbc7f3efc0a', -- Nike Air Max 39
    50,
    180000,
    9000000
),
(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1),
    'fb15f470-92ca-40f1-b355-a3099ca4b453', -- Nike Air Max 40
    30,
    180000,
    5400000
),

-- Items for second purchase order with Casual Walker
(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1 OFFSET 1),
    '73890d67-5af6-4ccd-974e-cb62772806ea', -- Casual Walker 39
    40,
    80000,
    3200000
),

-- Items for third purchase order with Business Formal
(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1 OFFSET 2), 
    'dbfd3ed1-52e2-4a9e-8d2c-16253298e51d', -- Business Formal 40
    35,
    165000,
    5775000
),
(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1 OFFSET 2),
    '6582a911-b824-4454-a414-2a4b3827af79', -- Business Formal 41
    25,
    165000,
    4125000
),

-- Items for fourth purchase order (completed) with mixed products
(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1 OFFSET 3),
    '2ee7831f-0b9d-4d66-b0d5-424b82672b86', -- Casual Walker 41
    60,
    75000,
    4500000
),
(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1 OFFSET 3),
    'dc01ec63-68d7-4607-aad4-66d4e21bea05', -- Casual Walker 42
    45,
    75000,
    3375000
),

-- Items for more purchase orders with various Indonesian shoe products
(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1 OFFSET 4),
    '75096aa1-ef4c-44e0-bc40-62224c26bdb0', -- Nike Air Max 39
    25,
    180000,
    4500000
),

(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1 OFFSET 5),
    '9102826a-aac0-416f-9663-369e4e6df0a7', -- Casual Walker 40
    35,
    80000,
    2800000
),

(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1 OFFSET 6),
    'fbfdbf4e-ae22-4eb5-a4d5-9d7210bdf7c3', -- Nike Air Max 43
    20,
    180000,
    3600000
),

-- Additional items for variety
(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1 OFFSET 7),
    'b08eabad-f773-4778-9228-1fbc7f3efc0a', -- Nike Air Max 39
    40,
    180000,
    7200000
),

(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1 OFFSET 8),
    '73890d67-5af6-4ccd-974e-cb62772806ea', -- Casual Walker 39
    55,
    75000,
    4125000
),

(
    (SELECT id FROM purchase_orders ORDER BY created_at LIMIT 1 OFFSET 9),
    'dbfd3ed1-52e2-4a9e-8d2c-16253298e51d', -- Business Formal 40
    30,
    165000,
    4950000
);