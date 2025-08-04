-- Raw Materials Articles for Shoe Manufacturing
-- These are the materials used to manufacture the finished shoes

-- Get classification IDs
-- Raw Materials classification will be used for these articles

INSERT INTO articles (
    name,
    description,
    classification_id,
    barcode,
    base_price,
    selling_price,
    created_at,
    updated_at
) VALUES 

-- LEATHER MATERIALS
('Kulit Sapi Grade A', 'Premium cowhide leather for shoe uppers - natural brown', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'RAW001', 85000.00, 0.00, NOW(), NOW()),

('Kulit Kambing Lembut', 'Soft goat leather for premium shoe lining', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'RAW002', 65000.00, 0.00, NOW(), NOW()),

('Kulit Sintetis', 'High-quality synthetic leather for casual shoes', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'RAW003', 35000.00, 0.00, NOW(), NOW()),

-- RUBBER MATERIALS  
('Karet Sol Mentah', 'Natural rubber for shoe sole manufacturing', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'RAW004', 25000.00, 0.00, NOW(), NOW()),

('Karet EVA Foam', 'EVA foam material for comfort padding', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'RAW005', 18000.00, 0.00, NOW(), NOW()),

-- FABRIC MATERIALS
('Kain Canvas', 'Canvas fabric for casual shoe construction', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'RAW006', 22000.00, 0.00, NOW(), NOW()),

('Kain Mesh', 'Breathable mesh fabric for sports shoes', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'RAW007', 28000.00, 0.00, NOW(), NOW()),

-- ADHESIVES & CHEMICALS
('Lem Sepatu PU', 'Polyurethane adhesive for shoe assembly', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'RAW008', 45000.00, 0.00, NOW(), NOW()),

('Cairan Pembersih', 'Cleaning solution for leather preparation', 
 (SELECT id FROM classifications WHERE name = 'Raw Materials'), 
 'RAW009', 15000.00, 0.00, NOW(), NOW()),

-- COMPONENTS
('Tali Sepatu Nilon', 'Nylon shoelaces - various colors', 
 (SELECT id FROM classifications WHERE name = 'Components'), 
 'CMP001', 3500.00, 0.00, NOW(), NOW()),

('Eyelet Logam', 'Metal eyelets for lace holes', 
 (SELECT id FROM classifications WHERE name = 'Components'), 
 'CMP002', 1200.00, 0.00, NOW(), NOW()),

('Insole Foam', 'Comfort foam insoles', 
 (SELECT id FROM classifications WHERE name = 'Components'), 
 'CMP003', 8500.00, 0.00, NOW(), NOW()),

('Heel Counter', 'Plastic heel counter for shoe structure', 
 (SELECT id FROM classifications WHERE name = 'Components'), 
 'CMP004', 6500.00, 0.00, NOW(), NOW()),

('Zipper YKK', 'YKK brand zippers for boots', 
 (SELECT id FROM classifications WHERE name = 'Components'), 
 'CMP005', 12000.00, 0.00, NOW(), NOW()),

-- PACKAGING MATERIALS
('Kotak Sepatu Karton', 'Cardboard shoe boxes with logo', 
 (SELECT id FROM classifications WHERE name = 'Packaging Materials'), 
 'PKG001', 4500.00, 0.00, NOW(), NOW()),

('Plastik Pembungkus', 'Clear plastic shoe bags', 
 (SELECT id FROM classifications WHERE name = 'Packaging Materials'), 
 'PKG002', 850.00, 0.00, NOW(), NOW()),

('Kertas Tisu', 'Tissue paper for shoe stuffing', 
 (SELECT id FROM classifications WHERE name = 'Packaging Materials'), 
 'PKG003', 1200.00, 0.00, NOW(), NOW()),

('Stiker Label', 'Product labels and size stickers', 
 (SELECT id FROM classifications WHERE name = 'Packaging Materials'), 
 'PKG004', 2100.00, 0.00, NOW(), NOW());