-- Purchase Orders for Raw Materials (Fixed)
-- These would be orders from material suppliers to manufacture shoes

-- Create purchase orders for raw materials
INSERT INTO purchase_orders (
    supplier_id,
    order_date,
    status,
    total_amount,
    created_at,
    updated_at
) VALUES

-- Order from CV Kulit Jaya for leather materials
(
    '6d1ec8e0-3d38-42db-988b-8a253d0de747', -- CV Kulit Jaya
    '2025-01-20 08:00:00+07:00',
    'approved',
    12550000.00, -- Leather materials total
    NOW(),
    NOW()
),

-- Order from UD Footwear Prima for rubber and synthetic materials  
(
    '04505b14-da85-4d71-a42f-1187dbb6fbf8', -- UD Footwear Prima
    '2025-01-21 09:30:00+07:00',
    'approved',
    10850000.00, -- Rubber and synthetic materials total
    NOW(),
    NOW()
),

-- Order from PT Sepatu Indah for fabric and adhesive materials
(
    'fb637676-bc29-48c8-82a8-dfe09790d520', -- PT Sepatu Indah
    '2025-01-22 10:15:00+07:00',
    'approved',
    6005000.00, -- Fabric and adhesive materials total
    NOW(),
    NOW()
);