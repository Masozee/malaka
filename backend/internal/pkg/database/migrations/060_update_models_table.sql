-- +goose Up
ALTER TABLE models 
  ADD COLUMN code VARCHAR(50) UNIQUE,
  ADD COLUMN description TEXT,
  ADD COLUMN article_id UUID,
  ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- Update existing models with default values
UPDATE models SET 
  code = CASE 
    WHEN name = 'Running Pro' THEN 'RUN001'
    WHEN name = 'Classic Comfort' THEN 'CLA001'
    WHEN name = 'Business Elite' THEN 'BUS001'
    WHEN name = 'Sport X1' THEN 'SPO001'
    ELSE UPPER(LEFT(name, 3)) || '001'
  END,
  description = CASE
    WHEN name = 'Running Pro' THEN 'Professional running model with advanced features'
    WHEN name = 'Classic Comfort' THEN 'Comfortable classic model for daily wear'
    WHEN name = 'Business Elite' THEN 'Premium business model for professional settings'
    WHEN name = 'Sport X1' THEN 'High-performance sport model'
    ELSE 'Standard model'
  END,
  status = 'active'
WHERE code IS NULL;

-- Make code NOT NULL after populating
ALTER TABLE models ALTER COLUMN code SET NOT NULL;

-- Add foreign key constraint for article_id
ALTER TABLE models 
  ADD CONSTRAINT models_article_id_fkey 
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL;

-- +goose Down
ALTER TABLE models 
  DROP CONSTRAINT IF EXISTS models_article_id_fkey,
  DROP COLUMN code,
  DROP COLUMN description,
  DROP COLUMN article_id,
  DROP COLUMN status;