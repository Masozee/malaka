-- Goods Receipt Items Seed Data
-- Items for each goods receipt with realistic quantities

INSERT INTO goods_receipt_items (
    id,
    goods_receipt_id,
    article_id,
    quantity
) VALUES
-- Items for first goods receipt (various shoe products)
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1),
    (SELECT id FROM articles WHERE name LIKE '%Sepatu Pantofel%' LIMIT 1),
    25
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1),
    (SELECT id FROM articles WHERE name LIKE '%Sepatu Sneakers%' LIMIT 1),
    40
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1),
    (SELECT id FROM articles WHERE name LIKE '%Sepatu Boots%' LIMIT 1),
    15
),

-- Items for second goods receipt (leather materials)
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 1),
    (SELECT id FROM articles WHERE name LIKE '%Kulit%' OR name LIKE '%Leather%' LIMIT 1),
    100
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 1),
    (SELECT id FROM articles WHERE name LIKE '%Sepatu Formal%' OR name LIKE '%Pantofel%' LIMIT 1),
    30
),

-- Items for third goods receipt (casual shoes)
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 2),
    (SELECT id FROM articles WHERE name LIKE '%Casual%' OR name LIKE '%Sneakers%' LIMIT 1),
    60
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 2),
    (SELECT id FROM articles WHERE name LIKE '%Sandal%' LIMIT 1),
    45
),

-- Items for fourth goods receipt (work boots)
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 3),
    (SELECT id FROM articles WHERE name LIKE '%Boots%' OR name LIKE '%Safety%' LIMIT 1),
    20
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 3),
    (SELECT id FROM articles WHERE name LIKE '%Sepatu Kerja%' LIMIT 1),
    35
),

-- Items for fifth goods receipt (mixed products)
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 4),
    (SELECT id FROM articles LIMIT 1),
    50
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 4),
    (SELECT id FROM articles LIMIT 1 OFFSET 1),
    25
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 4),
    (SELECT id FROM articles LIMIT 1 OFFSET 2),
    35
),

-- Items for sixth goods receipt (textile materials)
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 5),
    (SELECT id FROM articles WHERE name LIKE '%Tekstil%' OR name LIKE '%Fabric%' LIMIT 1),
    80
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 5),
    (SELECT id FROM articles WHERE name LIKE '%Rajut%' OR name LIKE '%Knit%' LIMIT 1),
    60
),

-- Items for seventh goods receipt (sports shoes)
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 6),
    (SELECT id FROM articles WHERE name LIKE '%Olahraga%' OR name LIKE '%Sport%' LIMIT 1),
    40
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 6),
    (SELECT id FROM articles WHERE name LIKE '%Running%' OR name LIKE '%Athletic%' LIMIT 1),
    30
),

-- Items for eighth goods receipt (plastic components)
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 7),
    (SELECT id FROM articles WHERE name LIKE '%Plastik%' OR name LIKE '%Plastic%' LIMIT 1),
    120
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 7),
    (SELECT id FROM articles WHERE name LIKE '%Sol%' OR name LIKE '%Sole%' LIMIT 1),
    90
),

-- Items for recent receipts (9th-12th)
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 8),
    (SELECT id FROM articles LIMIT 1 OFFSET 3),
    45
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 8),
    (SELECT id FROM articles LIMIT 1 OFFSET 4),
    55
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 9),
    (SELECT id FROM articles LIMIT 1 OFFSET 5),
    30
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 9),
    (SELECT id FROM articles LIMIT 1 OFFSET 6),
    40
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 10),
    (SELECT id FROM articles LIMIT 1 OFFSET 7),
    65
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 11),
    (SELECT id FROM articles LIMIT 1 OFFSET 8),
    35
),

-- Items for today's receipts (13th-15th)
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 12),
    (SELECT id FROM articles LIMIT 1 OFFSET 9),
    50
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 13),
    (SELECT id FROM articles LIMIT 1 OFFSET 10),
    25
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 14),
    (SELECT id FROM articles LIMIT 1 OFFSET 11),
    40
),

-- Items for future scheduled receipts (16th-20th)
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 15),
    (SELECT id FROM articles LIMIT 1 OFFSET 12),
    75
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 16),
    (SELECT id FROM articles LIMIT 1 OFFSET 13),
    60
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 17),
    (SELECT id FROM articles LIMIT 1 OFFSET 14),
    45
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 18),
    (SELECT id FROM articles LIMIT 1 OFFSET 15),
    55
),
(
    gen_random_uuid(),
    (SELECT id FROM goods_receipts ORDER BY created_at LIMIT 1 OFFSET 19),
    (SELECT id FROM articles LIMIT 1 OFFSET 16),
    30
);