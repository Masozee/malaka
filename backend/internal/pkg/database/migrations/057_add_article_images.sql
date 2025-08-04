-- +goose Up
-- Add image columns to articles table
ALTER TABLE articles 
ADD COLUMN image_url TEXT,
ADD COLUMN image_urls TEXT[], 
ADD COLUMN thumbnail_url TEXT;

-- +goose Down
-- Remove image columns from articles table
ALTER TABLE articles 
DROP COLUMN IF EXISTS image_url,
DROP COLUMN IF EXISTS image_urls,
DROP COLUMN IF EXISTS thumbnail_url;