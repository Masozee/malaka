-- Procurement Purchase Orders Seed Data
-- This creates sample purchase orders for the procurement module

-- Insert procurement purchase orders with dynamic supplier and user references
INSERT INTO procurement_purchase_orders (
    id, po_number, supplier_id, order_date, expected_delivery_date,
    delivery_address, payment_terms, currency, subtotal, discount_amount,
    tax_amount, shipping_cost, total_amount, status, payment_status,
    notes, created_by, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    'PO-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-0001',
    s.id,
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '14 days',
    'Jl. Raya Industri No. 100, Kawasan Industri Pulogadung, Jakarta Timur 13920',
    'Net 30',
    'IDR',
    25000000,
    1250000,
    2375000,
    500000,
    26625000,
    'confirmed',
    'unpaid',
    'Pesanan kulit sapi untuk produksi sepatu formal',
    u.id,
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE - INTERVAL '5 days'
FROM suppliers s, users u
WHERE s.name = 'PT. Pemasok Kulit Jaya' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO procurement_purchase_orders (
    id, po_number, supplier_id, order_date, expected_delivery_date,
    delivery_address, payment_terms, currency, subtotal, discount_amount,
    tax_amount, shipping_cost, total_amount, status, payment_status,
    notes, created_by, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    'PO-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-0002',
    s.id,
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '10 days',
    'Jl. Raya Industri No. 100, Kawasan Industri Pulogadung, Jakarta Timur 13920',
    'Net 15',
    'IDR',
    15000000,
    750000,
    1425000,
    300000,
    15975000,
    'sent',
    'unpaid',
    'Sol karet untuk sepatu sport',
    u.id,
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE - INTERVAL '4 days'
FROM suppliers s, users u
WHERE s.name = 'CV. Pemasok Sole Sepatu' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO procurement_purchase_orders (
    id, po_number, supplier_id, order_date, expected_delivery_date,
    delivery_address, payment_terms, currency, subtotal, discount_amount,
    tax_amount, shipping_cost, total_amount, status, payment_status,
    notes, created_by, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    'PO-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-0003',
    s.id,
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '21 days',
    'Jl. Raya Industri No. 100, Kawasan Industri Pulogadung, Jakarta Timur 13920',
    'Cash',
    'IDR',
    8500000,
    0,
    850000,
    200000,
    9550000,
    'draft',
    'unpaid',
    'Tali sepatu berbagai warna',
    u.id,
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE - INTERVAL '3 days'
FROM suppliers s, users u
WHERE s.name = 'UD. Tali Sepatu Berkualitas' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO procurement_purchase_orders (
    id, po_number, supplier_id, order_date, expected_delivery_date,
    delivery_address, payment_terms, currency, subtotal, discount_amount,
    tax_amount, shipping_cost, total_amount, status, payment_status,
    notes, created_by, sent_at, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    'PO-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-0004',
    s.id,
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '5 days',
    'Jl. Raya Industri No. 100, Kawasan Industri Pulogadung, Jakarta Timur 13920',
    'Net 45',
    'IDR',
    45000000,
    2250000,
    4275000,
    750000,
    47775000,
    'shipped',
    'partial',
    'Bahan sintetis premium untuk sepatu casual',
    u.id,
    CURRENT_DATE - INTERVAL '8 days',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE - INTERVAL '2 days'
FROM suppliers s, users u
WHERE s.name = 'CV. Bahan Sintetis Sepatu' AND u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO procurement_purchase_orders (
    id, po_number, supplier_id, order_date, expected_delivery_date,
    delivery_address, payment_terms, currency, subtotal, discount_amount,
    tax_amount, shipping_cost, total_amount, status, payment_status,
    notes, created_by, sent_at, confirmed_at, received_at, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    'PO-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-0005',
    s.id,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '10 days',
    'Jl. Raya Industri No. 100, Kawasan Industri Pulogadung, Jakarta Timur 13920',
    'Net 30',
    'IDR',
    32000000,
    1600000,
    3040000,
    400000,
    33840000,
    'received',
    'paid',
    'Lem khusus sepatu kulit',
    u.id,
    CURRENT_DATE - INTERVAL '28 days',
    CURRENT_DATE - INTERVAL '25 days',
    CURRENT_DATE - INTERVAL '12 days',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '12 days'
FROM suppliers s, users u
WHERE s.name = 'PT. Pemasok Lem Sepatu' AND u.username = 'admin'
ON CONFLICT DO NOTHING;
