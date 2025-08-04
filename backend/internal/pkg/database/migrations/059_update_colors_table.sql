-- +goose Up
-- Add new columns
ALTER TABLE colors 
  ADD COLUMN code VARCHAR(50),
  ADD COLUMN description TEXT,
  ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- Rename existing column
ALTER TABLE colors RENAME COLUMN hex TO hex_code;

-- Update existing colors with default values
UPDATE colors SET 
  code = UPPER(LEFT(name, 3)) || LPAD(row_number::TEXT, 3, '0'),
  status = 'active'
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number 
  FROM colors 
  WHERE code IS NULL
) numbered
WHERE colors.id = numbered.id;

-- Make code NOT NULL and UNIQUE after populating
ALTER TABLE colors ALTER COLUMN code SET NOT NULL;
ALTER TABLE colors ADD CONSTRAINT colors_code_unique UNIQUE (code);

-- +goose Down
ALTER TABLE colors 
  RENAME COLUMN hex_code TO hex,
  DROP COLUMN code,
  DROP COLUMN description,  
  DROP COLUMN status;