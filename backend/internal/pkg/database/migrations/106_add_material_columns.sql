-- +goose Up
ALTER TABLE materials ADD COLUMN IF NOT EXISTS current_stock INTEGER DEFAULT 0;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT '';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- Update seed materials with some stock and location data
UPDATE materials SET current_stock = 150, location = 'WH-A-01' WHERE material_code = 'MAT001';
UPDATE materials SET current_stock = 500, location = 'WH-A-02' WHERE material_code = 'MAT002';
UPDATE materials SET current_stock = 25, location = 'WH-B-01' WHERE material_code = 'MAT003';
UPDATE materials SET current_stock = 0, location = 'WH-B-02' WHERE material_code = 'MAT004';
UPDATE materials SET current_stock = 3000, location = 'WH-C-01' WHERE material_code = 'MAT005';
UPDATE materials SET current_stock = 200, location = 'WH-C-02' WHERE material_code = 'MAT006';
UPDATE materials SET current_stock = 80, location = 'WH-D-01' WHERE material_code = 'MAT007';
UPDATE materials SET current_stock = 45, location = 'WH-D-02' WHERE material_code = 'MAT008';
UPDATE materials SET current_stock = 600, location = 'WH-E-01' WHERE material_code = 'MAT009';
UPDATE materials SET current_stock = 150, location = 'WH-E-02' WHERE material_code = 'MAT010';
UPDATE materials SET current_stock = 90, location = 'WH-F-01' WHERE material_code = 'MAT011';
UPDATE materials SET current_stock = 1200, location = 'WH-F-02' WHERE material_code = 'MAT012';
UPDATE materials SET current_stock = 350, location = 'WH-A-03' WHERE material_code = 'MAT013';
UPDATE materials SET current_stock = 75, location = 'WH-B-03' WHERE material_code = 'MAT014';
UPDATE materials SET current_stock = 2500, location = 'WH-C-03' WHERE material_code = 'MAT015';

-- +goose Down
ALTER TABLE materials DROP COLUMN IF EXISTS current_stock;
ALTER TABLE materials DROP COLUMN IF EXISTS location;
ALTER TABLE materials DROP COLUMN IF EXISTS description;
