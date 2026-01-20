-- +goose Up
-- +goose NO TRANSACTION
-- Add barcode_url field to articles table to store MinIO barcode image URLs
ALTER TABLE articles ADD COLUMN IF NOT EXISTS barcode_url TEXT;

-- Add index for barcode_url field for faster queries when filtering by barcode URL existence
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_barcode_url ON articles (barcode_url) WHERE barcode_url IS NOT NULL;

-- +goose Down
-- Remove the index first, then the column
DROP INDEX IF EXISTS idx_articles_barcode_url;
ALTER TABLE articles DROP COLUMN IF EXISTS barcode_url;