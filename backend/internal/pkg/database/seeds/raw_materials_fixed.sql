-- Raw Materials Articles for Shoe Manufacturing (Fixed)
-- Using default values for color, model, size since raw materials don't have these attributes

-- Raw materials with realistic Indonesian pricing
INSERT INTO articles (
    name,
    description,
    classification_id,
    color_id,
    model_id,
    size_id,
    supplier_id,
    barcode,
    price,
    created_at,
    updated_at
) VALUES 

-- LEATHER MATERIALS
('Kulit Sapi Grade A', 'Premium cowhide leather for shoe uppers - per square meter', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'e5b51627-8753-47a2-ab94-e3892e6de029', -- Brown color
 '9e15f86b-5d78-4e20-9b03-b77c0dfafbd1', -- Classic Comfort model
 'faa400e2-fd5e-4b86-9866-de9ff6935e9b', -- Size 39 (default)
 '6d1ec8e0-3d38-42db-988b-8a253d0de747', -- CV Kulit Jaya supplier
 'RAW001', 85000.00, NOW(), NOW()),

('Kulit Kambing Lembut', 'Soft goat leather for premium shoe lining - per square meter', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'a1f01427-7efc-47e0-9a68-e020db4656d2', -- Black color
 '9e15f86b-5d78-4e20-9b03-b77c0dfafbd1', -- Classic Comfort model
 'faa400e2-fd5e-4b86-9866-de9ff6935e9b', -- Size 39 (default)
 '6d1ec8e0-3d38-42db-988b-8a253d0de747', -- CV Kulit Jaya supplier
 'RAW002', 65000.00, NOW(), NOW()),

('Kulit Sintetis', 'High-quality synthetic leather for casual shoes - per square meter', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'a1f01427-7efc-47e0-9a68-e020db4656d2', -- Black color
 '99ba6179-9b20-449b-96c3-7e0e748142e7', -- Running Pro model
 'faa400e2-fd5e-4b86-9866-de9ff6935e9b', -- Size 39 (default)
 '04505b14-da85-4d71-a42f-1187dbb6fbf8', -- UD Footwear Prima supplier
 'RAW003', 35000.00, NOW(), NOW()),

-- RUBBER MATERIALS  
('Karet Sol Mentah', 'Natural rubber for shoe sole manufacturing - per kg', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'a1f01427-7efc-47e0-9a68-e020db4656d2', -- Black color
 '99ba6179-9b20-449b-96c3-7e0e748142e7', -- Running Pro model
 'faa400e2-fd5e-4b86-9866-de9ff6935e9b', -- Size 39 (default)
 '04505b14-da85-4d71-a42f-1187dbb6fbf8', -- UD Footwear Prima supplier
 'RAW004', 25000.00, NOW(), NOW()),

('Karet EVA Foam', 'EVA foam material for comfort padding - per sheet', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 '01f3e42b-73c8-4fa6-936e-b709016921cf', -- White color
 '99ba6179-9b20-449b-96c3-7e0e748142e7', -- Running Pro model
 'faa400e2-fd5e-4b86-9866-de9ff6935e9b', -- Size 39 (default)
 '04505b14-da85-4d71-a42f-1187dbb6fbf8', -- UD Footwear Prima supplier
 'RAW005', 18000.00, NOW(), NOW()),

-- FABRIC MATERIALS
('Kain Canvas', 'Canvas fabric for casual shoe construction - per meter', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'e5b51627-8753-47a2-ab94-e3892e6de029', -- Brown color
 '9e15f86b-5d78-4e20-9b03-b77c0dfafbd1', -- Classic Comfort model
 'faa400e2-fd5e-4b86-9866-de9ff6935e9b', -- Size 39 (default)
 'fb637676-bc29-48c8-82a8-dfe09790d520', -- PT Sepatu Indah supplier
 'RAW006', 22000.00, NOW(), NOW()),

('Kain Mesh', 'Breathable mesh fabric for sports shoes - per meter', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 '01f3e42b-73c8-4fa6-936e-b709016921cf', -- White color
 '99ba6179-9b20-449b-96c3-7e0e748142e7', -- Running Pro model
 'faa400e2-fd5e-4b86-9866-de9ff6935e9b', -- Size 39 (default)
 'fb637676-bc29-48c8-82a8-dfe09790d520', -- PT Sepatu Indah supplier
 'RAW007', 28000.00, NOW(), NOW()),

-- ADHESIVES & CHEMICALS
('Lem Sepatu PU', 'Polyurethane adhesive for shoe assembly - per liter', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 '01f3e42b-73c8-4fa6-936e-b709016921cf', -- White color
 '9e15f86b-5d78-4e20-9b03-b77c0dfafbd1', -- Classic Comfort model
 'faa400e2-fd5e-4b86-9866-de9ff6935e9b', -- Size 39 (default)
 'fb637676-bc29-48c8-82a8-dfe09790d520', -- PT Sepatu Indah supplier
 'RAW008', 45000.00, NOW(), NOW()),

('Cairan Pembersih', 'Cleaning solution for leather preparation - per liter', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 '01f3e42b-73c8-4fa6-936e-b709016921cf', -- White color
 '9e15f86b-5d78-4e20-9b03-b77c0dfafbd1', -- Classic Comfort model
 'faa400e2-fd5e-4b86-9866-de9ff6935e9b', -- Size 39 (default)
 '6d1ec8e0-3d38-42db-988b-8a253d0de747', -- CV Kulit Jaya supplier
 'RAW009', 15000.00, NOW(), NOW());