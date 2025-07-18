-- +goose Up
CREATE TABLE simple_goods_issues (
    id VARCHAR(10) PRIMARY KEY,
    warehouse_id VARCHAR(10) NOT NULL REFERENCES warehouses(id),
    issue_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE simple_goods_issues;