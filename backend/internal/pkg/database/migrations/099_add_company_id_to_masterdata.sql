-- +goose Up
-- Add company_id to all masterdata tables for multi-tenant isolation
-- Every entity in the ERP must be scoped to a company

ALTER TABLE classifications ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE colors ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE models ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE sizes ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE barcodes ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE prices ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE couriers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE courier_rates ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE depstores ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Create indexes for company_id filtering performance
CREATE INDEX IF NOT EXISTS idx_classifications_company_id ON classifications(company_id);
CREATE INDEX IF NOT EXISTS idx_colors_company_id ON colors(company_id);
CREATE INDEX IF NOT EXISTS idx_articles_company_id ON articles(company_id);
CREATE INDEX IF NOT EXISTS idx_models_company_id ON models(company_id);
CREATE INDEX IF NOT EXISTS idx_sizes_company_id ON sizes(company_id);
CREATE INDEX IF NOT EXISTS idx_barcodes_company_id ON barcodes(company_id);
CREATE INDEX IF NOT EXISTS idx_prices_company_id ON prices(company_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_company_id ON gallery_images(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_company_id ON warehouses(company_id);
CREATE INDEX IF NOT EXISTS idx_couriers_company_id ON couriers(company_id);
CREATE INDEX IF NOT EXISTS idx_courier_rates_company_id ON courier_rates(company_id);
CREATE INDEX IF NOT EXISTS idx_depstores_company_id ON depstores(company_id);
CREATE INDEX IF NOT EXISTS idx_divisions_company_id ON divisions(company_id);

-- +goose Down
ALTER TABLE classifications DROP COLUMN IF EXISTS company_id;
ALTER TABLE colors DROP COLUMN IF EXISTS company_id;
ALTER TABLE articles DROP COLUMN IF EXISTS company_id;
ALTER TABLE models DROP COLUMN IF EXISTS company_id;
ALTER TABLE sizes DROP COLUMN IF EXISTS company_id;
ALTER TABLE barcodes DROP COLUMN IF EXISTS company_id;
ALTER TABLE prices DROP COLUMN IF EXISTS company_id;
ALTER TABLE gallery_images DROP COLUMN IF EXISTS company_id;
ALTER TABLE suppliers DROP COLUMN IF EXISTS company_id;
ALTER TABLE warehouses DROP COLUMN IF EXISTS company_id;
ALTER TABLE couriers DROP COLUMN IF EXISTS company_id;
ALTER TABLE courier_rates DROP COLUMN IF EXISTS company_id;
ALTER TABLE depstores DROP COLUMN IF EXISTS company_id;
ALTER TABLE divisions DROP COLUMN IF EXISTS company_id;
