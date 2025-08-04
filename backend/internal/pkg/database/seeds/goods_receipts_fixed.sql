-- Fixed Goods Receipts Seed Data with proper UUIDs
-- Using actual purchase order and warehouse IDs from the database

INSERT INTO goods_receipts (
    purchase_order_id, 
    receipt_date,
    warehouse_id
) VALUES 
-- Receipts for approved/completed purchase orders with Jakarta warehouse (54b86dd3-9810-4077-b98b-2cf6ca962b6f)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' LIMIT 1),
    '2024-01-16 09:30:00+07:00',
    '54b86dd3-9810-4077-b98b-2cf6ca962b6f'
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' LIMIT 1 OFFSET 1),
    '2024-01-18 10:15:00+07:00',
    '54b86dd3-9810-4077-b98b-2cf6ca962b6f'
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' LIMIT 1 OFFSET 2),
    '2024-01-20 14:45:00+07:00',
    '54b86dd3-9810-4077-b98b-2cf6ca962b6f'
),

-- Receipts for Surabaya warehouse (3fdd1835-82e6-4858-83f0-95b4e6ce0935)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' LIMIT 1 OFFSET 3),
    '2024-01-22 08:20:00+07:00',
    '3fdd1835-82e6-4858-83f0-95b4e6ce0935'
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' LIMIT 1 OFFSET 4),
    '2024-01-24 11:30:00+07:00',
    '3fdd1835-82e6-4858-83f0-95b4e6ce0935'
),

-- Receipts for Bandung warehouse (cb63d830-0b26-4d12-ae5a-c68eef7f6af6)
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' LIMIT 1 OFFSET 5),
    '2024-01-26 13:10:00+07:00',
    'cb63d830-0b26-4d12-ae5a-c68eef7f6af6'
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' LIMIT 1 OFFSET 6),
    '2024-01-28 15:45:00+07:00',
    'cb63d830-0b26-4d12-ae5a-c68eef7f6af6'
),

-- Receipts for Medan warehouse (485b9b4b-112e-4d1b-b8d6-0b27fc03f357)
(
    (SELECT id FROM purchase_orders WHERE status = 'completed' LIMIT 1),
    '2024-01-30 09:00:00+07:00',
    '485b9b4b-112e-4d1b-b8d6-0b27fc03f357'
),

-- Recent receipts (last week)
(
    (SELECT id FROM purchase_orders WHERE status = 'completed' LIMIT 1 OFFSET 1),
    '2024-01-25 10:30:00+07:00',
    '54b86dd3-9810-4077-b98b-2cf6ca962b6f'
),
(
    (SELECT id FROM purchase_orders WHERE status = 'completed' LIMIT 1 OFFSET 2),
    '2024-01-27 14:20:00+07:00',
    '3fdd1835-82e6-4858-83f0-95b4e6ce0935'
),

-- Today's receipts
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at DESC LIMIT 1),
    CURRENT_TIMESTAMP,
    '54b86dd3-9810-4077-b98b-2cf6ca962b6f'
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at DESC LIMIT 1 OFFSET 1),
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    '3fdd1835-82e6-4858-83f0-95b4e6ce0935'
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY created_at DESC LIMIT 1 OFFSET 2),
    CURRENT_TIMESTAMP - INTERVAL '4 hours',
    'cb63d830-0b26-4d12-ae5a-c68eef7f6af6'
),

-- Future scheduled receipts (expected) - using approved orders
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY order_date DESC LIMIT 1),
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    '54b86dd3-9810-4077-b98b-2cf6ca962b6f'
),
(
    (SELECT id FROM purchase_orders WHERE status = 'approved' ORDER BY order_date DESC LIMIT 1 OFFSET 1),
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    '3fdd1835-82e6-4858-83f0-95b4e6ce0935'
);