-- +goose Up
-- Add indexes for article image fields
CREATE INDEX IF NOT EXISTS idx_articles_image_url ON articles(image_url) WHERE image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_thumbnail_url ON articles(thumbnail_url) WHERE thumbnail_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_image_urls ON articles USING GIN(image_urls) WHERE image_urls IS NOT NULL;

-- +goose Down
-- Remove indexes for article image fields
DROP INDEX IF EXISTS idx_articles_image_url;
DROP INDEX IF EXISTS idx_articles_thumbnail_url;
DROP INDEX IF EXISTS idx_articles_image_urls;