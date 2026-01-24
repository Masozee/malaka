-- Procurement Purchase Order Items Seed Data
-- This creates sample items for procurement purchase orders

-- Items for PO-0001 (Kulit Sapi - PT. Pemasok Kulit Jaya)
INSERT INTO procurement_purchase_order_items (
    id, purchase_order_id, item_name, description, specification,
    quantity, unit, unit_price, discount_percentage, tax_percentage,
    line_total, received_quantity, currency, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    po.id,
    'Kulit Sapi Grade A',
    'Kulit sapi berkualitas tinggi untuk upper sepatu formal',
    'Ketebalan 1.2-1.4mm, Warna coklat tua',
    100,
    'lembar',
    150000,
    5,
    10,
    15675000,
    0,
    'IDR',
    po.created_at,
    po.updated_at
FROM procurement_purchase_orders po
WHERE po.po_number LIKE '%0001'
ON CONFLICT DO NOTHING;

INSERT INTO procurement_purchase_order_items (
    id, purchase_order_id, item_name, description, specification,
    quantity, unit, unit_price, discount_percentage, tax_percentage,
    line_total, received_quantity, currency, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    po.id,
    'Kulit Sapi Grade B',
    'Kulit sapi untuk lining sepatu',
    'Ketebalan 0.8-1.0mm, Warna natural',
    80,
    'lembar',
    100000,
    5,
    10,
    8360000,
    0,
    'IDR',
    po.created_at,
    po.updated_at
FROM procurement_purchase_orders po
WHERE po.po_number LIKE '%0001'
ON CONFLICT DO NOTHING;

-- Items for PO-0002 (Sol Karet - CV. Pemasok Sole Sepatu)
INSERT INTO procurement_purchase_order_items (
    id, purchase_order_id, item_name, description, specification,
    quantity, unit, unit_price, discount_percentage, tax_percentage,
    line_total, received_quantity, currency, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    po.id,
    'Sol Karet Sport',
    'Sol karet anti-slip untuk sepatu sport',
    'Size 38-44, Warna hitam, Grip pattern zigzag',
    500,
    'pasang',
    25000,
    5,
    10,
    13068750,
    0,
    'IDR',
    po.created_at,
    po.updated_at
FROM procurement_purchase_orders po
WHERE po.po_number LIKE '%0002'
ON CONFLICT DO NOTHING;

INSERT INTO procurement_purchase_order_items (
    id, purchase_order_id, item_name, description, specification,
    quantity, unit, unit_price, discount_percentage, tax_percentage,
    line_total, received_quantity, currency, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    po.id,
    'Sol Karet Casual',
    'Sol karet nyaman untuk sepatu casual',
    'Size 38-44, Warna coklat',
    200,
    'pasang',
    20000,
    5,
    10,
    4180000,
    0,
    'IDR',
    po.created_at,
    po.updated_at
FROM procurement_purchase_orders po
WHERE po.po_number LIKE '%0002'
ON CONFLICT DO NOTHING;

-- Items for PO-0003 (Tali Sepatu - UD. Tali Sepatu Berkualitas)
INSERT INTO procurement_purchase_order_items (
    id, purchase_order_id, item_name, description, specification,
    quantity, unit, unit_price, discount_percentage, tax_percentage,
    line_total, received_quantity, currency, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    po.id,
    'Tali Sepatu Hitam',
    'Tali sepatu warna hitam polos',
    'Panjang 120cm, Lebar 8mm',
    1000,
    'pasang',
    3500,
    0,
    10,
    3850000,
    0,
    'IDR',
    po.created_at,
    po.updated_at
FROM procurement_purchase_orders po
WHERE po.po_number LIKE '%0003'
ON CONFLICT DO NOTHING;

INSERT INTO procurement_purchase_order_items (
    id, purchase_order_id, item_name, description, specification,
    quantity, unit, unit_price, discount_percentage, tax_percentage,
    line_total, received_quantity, currency, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    po.id,
    'Tali Sepatu Coklat',
    'Tali sepatu warna coklat',
    'Panjang 120cm, Lebar 8mm',
    800,
    'pasang',
    3500,
    0,
    10,
    3080000,
    0,
    'IDR',
    po.created_at,
    po.updated_at
FROM procurement_purchase_orders po
WHERE po.po_number LIKE '%0003'
ON CONFLICT DO NOTHING;

INSERT INTO procurement_purchase_order_items (
    id, purchase_order_id, item_name, description, specification,
    quantity, unit, unit_price, discount_percentage, tax_percentage,
    line_total, received_quantity, currency, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    po.id,
    'Tali Sepatu Putih',
    'Tali sepatu warna putih untuk sneakers',
    'Panjang 110cm, Lebar flat 10mm',
    500,
    'pasang',
    4000,
    0,
    10,
    2200000,
    0,
    'IDR',
    po.created_at,
    po.updated_at
FROM procurement_purchase_orders po
WHERE po.po_number LIKE '%0003'
ON CONFLICT DO NOTHING;

-- Items for PO-0004 (Bahan Sintetis - CV. Bahan Sintetis Sepatu)
INSERT INTO procurement_purchase_order_items (
    id, purchase_order_id, item_name, description, specification,
    quantity, unit, unit_price, discount_percentage, tax_percentage,
    line_total, received_quantity, currency, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    po.id,
    'PU Leather Premium',
    'Bahan PU leather untuk upper sepatu casual',
    'Ketebalan 1.0mm, Warna hitam, Tekstur halus',
    300,
    'meter',
    120000,
    5,
    10,
    37620000,
    150,
    'IDR',
    po.created_at,
    po.updated_at
FROM procurement_purchase_orders po
WHERE po.po_number LIKE '%0004'
ON CONFLICT DO NOTHING;

INSERT INTO procurement_purchase_order_items (
    id, purchase_order_id, item_name, description, specification,
    quantity, unit, unit_price, discount_percentage, tax_percentage,
    line_total, received_quantity, currency, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    po.id,
    'Mesh Breathable',
    'Bahan mesh untuk ventilasi sepatu',
    'Ketebalan 0.8mm, Warna abu-abu',
    150,
    'meter',
    45000,
    5,
    10,
    7055625,
    75,
    'IDR',
    po.created_at,
    po.updated_at
FROM procurement_purchase_orders po
WHERE po.po_number LIKE '%0004'
ON CONFLICT DO NOTHING;

-- Items for PO-0005 (Lem Sepatu - PT. Pemasok Lem Sepatu)
INSERT INTO procurement_purchase_order_items (
    id, purchase_order_id, item_name, description, specification,
    quantity, unit, unit_price, discount_percentage, tax_percentage,
    line_total, received_quantity, currency, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    po.id,
    'Lem Kulit Premium',
    'Lem khusus untuk bonding kulit ke sol',
    'Volume 1 liter, Daya rekat tinggi',
    200,
    'kaleng',
    85000,
    5,
    10,
    17765000,
    200,
    'IDR',
    po.created_at,
    po.updated_at
FROM procurement_purchase_orders po
WHERE po.po_number LIKE '%0005'
ON CONFLICT DO NOTHING;

INSERT INTO procurement_purchase_order_items (
    id, purchase_order_id, item_name, description, specification,
    quantity, unit, unit_price, discount_percentage, tax_percentage,
    line_total, received_quantity, currency, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    po.id,
    'Lem Finishing',
    'Lem untuk finishing detail sepatu',
    'Volume 500ml, Quick dry',
    150,
    'botol',
    65000,
    5,
    10,
    10188750,
    150,
    'IDR',
    po.created_at,
    po.updated_at
FROM procurement_purchase_orders po
WHERE po.po_number LIKE '%0005'
ON CONFLICT DO NOTHING;

INSERT INTO procurement_purchase_order_items (
    id, purchase_order_id, item_name, description, specification,
    quantity, unit, unit_price, discount_percentage, tax_percentage,
    line_total, received_quantity, currency, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    po.id,
    'Primer Lem',
    'Primer untuk persiapan permukaan sebelum pengeleman',
    'Volume 500ml',
    100,
    'botol',
    45000,
    5,
    10,
    4702500,
    100,
    'IDR',
    po.created_at,
    po.updated_at
FROM procurement_purchase_orders po
WHERE po.po_number LIKE '%0005'
ON CONFLICT DO NOTHING;
