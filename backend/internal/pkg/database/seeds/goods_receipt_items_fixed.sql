-- Fixed Goods Receipt Items Seed Data
-- Items for each goods receipt with realistic quantities using actual UUIDs

INSERT INTO goods_receipt_items (
    goods_receipt_id,
    article_id,
    quantity
) VALUES
-- Items for first goods receipt (Nike Air Max products)
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1),
    'b08eabad-f773-4778-9228-1fbc7f3efc0a', -- Nike Air Max 39
    25
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1),
    'fb15f470-92ca-40f1-b355-a3099ca4b453', -- Nike Air Max 40
    40
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1),
    'fbfdbf4e-ae22-4eb5-a4d5-9d7210bdf7c3', -- Nike Air Max 43
    15
),

-- Items for second goods receipt (Casual Walker products)
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 1),
    '73890d67-5af6-4ccd-974e-cb62772806ea', -- Casual Walker 39
    30
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 1),
    '9102826a-aac0-416f-9663-369e4e6df0a7', -- Casual Walker 40
    35
),

-- Items for third goods receipt (Business Formal products)
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 2),
    'dbfd3ed1-52e2-4a9e-8d2c-16253298e51d', -- Business Formal 40
    20
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 2),
    '6582a911-b824-4454-a414-2a4b3827af79', -- Business Formal 41
    25
),

-- Items for fourth goods receipt (Mixed Casual Walker)
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 3),
    '2ee7831f-0b9d-4d66-b0d5-424b82672b86', -- Casual Walker 41
    45
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 3),
    'dc01ec63-68d7-4607-aad4-66d4e21bea05', -- Casual Walker 42
    30
),

-- Items for fifth goods receipt (Nike products)
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 4),
    '75096aa1-ef4c-44e0-bc40-62224c26bdb0', -- Nike Air Max 39
    50
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 4),
    'fb15f470-92ca-40f1-b355-a3099ca4b453', -- Nike Air Max 40
    25
),

-- Items for sixth goods receipt (Business Formal)
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 5),
    'dbfd3ed1-52e2-4a9e-8d2c-16253298e51d', -- Business Formal 40
    35
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 5),
    '6582a911-b824-4454-a414-2a4b3827af79', -- Business Formal 41
    40
),

-- Items for seventh goods receipt (Casual products)
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 6),
    '73890d67-5af6-4ccd-974e-cb62772806ea', -- Casual Walker 39
    60
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 6),
    '9102826a-aac0-416f-9663-369e4e6df0a7', -- Casual Walker 40
    35
),

-- Items for eighth goods receipt (Nike products)
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 7),
    'b08eabad-f773-4778-9228-1fbc7f3efc0a', -- Nike Air Max 39
    45
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 7),
    'fbfdbf4e-ae22-4eb5-a4d5-9d7210bdf7c3', -- Nike Air Max 43
    30
),

-- Items for recent receipts (9th-12th)
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 8),
    '2ee7831f-0b9d-4d66-b0d5-424b82672b86', -- Casual Walker 41
    55
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 9),
    'dc01ec63-68d7-4607-aad4-66d4e21bea05', -- Casual Walker 42
    40
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 10),
    '75096aa1-ef4c-44e0-bc40-62224c26bdb0', -- Nike Air Max 39
    65
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 11),
    'dbfd3ed1-52e2-4a9e-8d2c-16253298e51d', -- Business Formal 40
    35
),

-- Items for today's receipts (13th-15th)
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 12),
    '6582a911-b824-4454-a414-2a4b3827af79', -- Business Formal 41
    50
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 13),
    '73890d67-5af6-4ccd-974e-cb62772806ea', -- Casual Walker 39
    25
),
(
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 14),
    'fb15f470-92ca-40f1-b355-a3099ca4b453', -- Nike Air Max 40
    40
);