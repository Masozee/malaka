-- Fixed Purchase Orders Seed Data with proper UUIDs
-- Using actual supplier IDs from the database

INSERT INTO purchase_orders (supplier_id, order_date, status, total_amount) VALUES
-- PT Sepatu Indah orders
('fb637676-bc29-48c8-82a8-dfe09790d520', '2024-01-10', 'pending', 4500000),
('fb637676-bc29-48c8-82a8-dfe09790d520', '2024-01-15', 'approved', 3200000),
('fb637676-bc29-48c8-82a8-dfe09790d520', '2024-01-20', 'approved', 5800000),
('fb637676-bc29-48c8-82a8-dfe09790d520', '2024-01-25', 'completed', 2850000),

-- CV Kulit Jaya orders  
('6d1ec8e0-3d38-42db-988b-8a253d0de747', '2024-01-12', 'pending', 3850000),
('6d1ec8e0-3d38-42db-988b-8a253d0de747', '2024-01-17', 'approved', 1750000),
('6d1ec8e0-3d38-42db-988b-8a253d0de747', '2024-01-22', 'approved', 3950000),
('6d1ec8e0-3d38-42db-988b-8a253d0de747', '2024-01-27', 'completed', 2950000),

-- UD Footwear Prima orders
('04505b14-da85-4d71-a42f-1187dbb6fbf8', '2024-01-14', 'pending', 1650000),
('04505b14-da85-4d71-a42f-1187dbb6fbf8', '2024-01-19', 'approved', 2850000),
('04505b14-da85-4d71-a42f-1187dbb6fbf8', '2024-01-24', 'approved', 3250000),
('04505b14-da85-4d71-a42f-1187dbb6fbf8', '2024-01-29', 'completed', 4850000),

-- Recent orders for goods receipt
('fb637676-bc29-48c8-82a8-dfe09790d520', '2024-01-26', 'approved', 7250000),
('6d1ec8e0-3d38-42db-988b-8a253d0de747', '2024-01-28', 'approved', 3850000),
('04505b14-da85-4d71-a42f-1187dbb6fbf8', '2024-01-30', 'approved', 2250000),

-- Today's orders
('fb637676-bc29-48c8-82a8-dfe09790d520', CURRENT_DATE, 'pending', 5500000),
('6d1ec8e0-3d38-42db-988b-8a253d0de747', CURRENT_DATE, 'pending', 4200000),
('04505b14-da85-4d71-a42f-1187dbb6fbf8', CURRENT_DATE, 'pending', 3800000),

-- Future orders
('fb637676-bc29-48c8-82a8-dfe09790d520', CURRENT_DATE + INTERVAL '2 days', 'pending', 6200000),
('6d1ec8e0-3d38-42db-988b-8a253d0de747', CURRENT_DATE + INTERVAL '3 days', 'pending', 4800000);