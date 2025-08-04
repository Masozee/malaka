-- Fixed Purchase Order Items Seed Data
-- Creating purchase order items for existing purchase orders with proper pricing

-- Get the first few purchase orders and create items for them
-- We'll use actual article UUIDs and realistic Indonesian pricing

INSERT INTO purchase_order_items (
    purchase_order_id,
    article_id,
    quantity,
    unit_price,
    total_price
) VALUES

-- Items for 1st Purchase Order (Nike Air Max products)
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
    40,
    450000.00,
    18000000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1),
    'fbfdbf4e-ae22-4eb5-a4d5-9d7210bdf7c3', -- Nike Air Max 43
    15,
    450000.00,
    6750000.00
),

-- Items for 2nd Purchase Order (Casual Walker products)
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
    35,
    320000.00,
    11200000.00
),

-- Items for 3rd Purchase Order (Business Formal products)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 2),
    'dbfd3ed1-52e2-4a9e-8d2c-16253298e51d', -- Business Formal 40
    20,
    580000.00,
    11600000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 2),
    '6582a911-b824-4454-a414-2a4b3827af79', -- Business Formal 41
    25,
    580000.00,
    14500000.00
),

-- Items for 4th Purchase Order (Mixed Casual Walker)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 3),
    '2ee7831f-0b9d-4d66-b0d5-424b82672b86', -- Casual Walker 41
    45,
    320000.00,
    14400000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 3),
    'dc01ec63-68d7-4607-aad4-66d4e21bea05', -- Casual Walker 42
    30,
    320000.00,
    9600000.00
),

-- Items for 5th Purchase Order (Nike products)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 4),
    '75096aa1-ef4c-44e0-bc40-62224c26bdb0', -- Nike Air Max 39
    50,
    450000.00,
    22500000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 4),
    'fb15f470-92ca-40f1-b355-a3099ca4b453', -- Nike Air Max 40
    25,
    450000.00,
    11250000.00
),

-- Items for 6th Purchase Order (Business Formal)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 5),
    'dbfd3ed1-52e2-4a9e-8d2c-16253298e51d', -- Business Formal 40
    35,
    580000.00,
    20300000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 5),
    '6582a911-b824-4454-a414-2a4b3827af79', -- Business Formal 41
    40,
    580000.00,
    23200000.00
),

-- Items for 7th Purchase Order (Casual products)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 6),
    '73890d67-5af6-4ccd-974e-cb62772806ea', -- Casual Walker 39
    60,
    320000.00,
    19200000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 6),
    '9102826a-aac0-416f-9663-369e4e6df0a7', -- Casual Walker 40
    35,
    320000.00,
    11200000.00
),

-- Items for 8th Purchase Order (Nike products)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 7),
    'b08eabad-f773-4778-9228-1fbc7f3efc0a', -- Nike Air Max 39
    45,
    450000.00,
    20250000.00
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 7),
    'fbfdbf4e-ae22-4eb5-a4d5-9d7210bdf7c3', -- Nike Air Max 43
    30,
    450000.00,
    13500000.00
),

-- Items for 9th Purchase Order (Casual Walker)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 8),
    '2ee7831f-0b9d-4d66-b0d5-424b82672b86', -- Casual Walker 41
    55,
    320000.00,
    17600000.00
),

-- Items for 10th Purchase Order (Casual Walker)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 9),
    'dc01ec63-68d7-4607-aad4-66d4e21bea05', -- Casual Walker 42
    40,
    320000.00,
    12800000.00
),

-- Items for 11th Purchase Order (Nike)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 10),
    '75096aa1-ef4c-44e0-bc40-62224c26bdb0', -- Nike Air Max 39
    65,
    450000.00,
    29250000.00
),

-- Items for 12th Purchase Order (Business Formal)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 11),
    'dbfd3ed1-52e2-4a9e-8d2c-16253298e51d', -- Business Formal 40
    35,
    580000.00,
    20300000.00
),

-- Items for 13th Purchase Order (Business Formal)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 12),
    '6582a911-b824-4454-a414-2a4b3827af79', -- Business Formal 41
    50,
    580000.00,
    29000000.00
),

-- Items for 14th Purchase Order (Casual Walker)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 13),
    '73890d67-5af6-4ccd-974e-cb62772806ea', -- Casual Walker 39
    25,
    320000.00,
    8000000.00
),

-- Items for 15th Purchase Order (Nike)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at LIMIT 1 OFFSET 14),
    'fb15f470-92ca-40f1-b355-a3099ca4b453', -- Nike Air Max 40
    40,
    450000.00,
    18000000.00
);