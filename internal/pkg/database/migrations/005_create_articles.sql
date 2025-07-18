-- +goose Up
CREATE TABLE articles (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    classification_id VARCHAR(255) NOT NULL REFERENCES classifications(id) ON DELETE CASCADE,
    color_id VARCHAR(255) NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
    model_id VARCHAR(255) NOT NULL,
    size_id VARCHAR(255) NOT NULL,
    supplier_id VARCHAR(255) NOT NULL,
    barcode VARCHAR(255) UNIQUE,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE articles;
