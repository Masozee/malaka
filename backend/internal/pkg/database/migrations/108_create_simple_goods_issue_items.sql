-- +goose Up
CREATE TABLE simple_goods_issue_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goods_issue_id UUID NOT NULL REFERENCES simple_goods_issues(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    notes TEXT DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_simple_goods_issue_items_issue_id ON simple_goods_issue_items(goods_issue_id);

-- +goose Down
DROP TABLE IF EXISTS simple_goods_issue_items;
