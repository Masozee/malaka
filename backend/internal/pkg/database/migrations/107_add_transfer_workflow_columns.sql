-- +goose Up

-- Transfer order workflow columns
ALTER TABLE transfer_orders ADD COLUMN notes TEXT DEFAULT '';
ALTER TABLE transfer_orders ADD COLUMN shipped_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE transfer_orders ADD COLUMN received_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE transfer_orders ADD COLUMN approved_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE transfer_orders ADD COLUMN cancelled_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE transfer_orders ADD COLUMN shipped_by UUID REFERENCES users(id);
ALTER TABLE transfer_orders ADD COLUMN received_by UUID REFERENCES users(id);
ALTER TABLE transfer_orders ADD COLUMN approved_by UUID REFERENCES users(id);
ALTER TABLE transfer_orders ADD COLUMN cancelled_by UUID REFERENCES users(id);
ALTER TABLE transfer_orders ADD COLUMN created_by UUID REFERENCES users(id);
ALTER TABLE transfer_orders ADD COLUMN cancel_reason TEXT DEFAULT '';

-- Transfer item: received_quantity for item-by-item receive tracking
ALTER TABLE transfer_items ADD COLUMN received_quantity INT DEFAULT 0;
ALTER TABLE transfer_items ADD COLUMN has_discrepancy BOOLEAN DEFAULT FALSE;

-- Index on status for filtered queries
CREATE INDEX IF NOT EXISTS idx_transfer_orders_status ON transfer_orders(status);

-- +goose Down
ALTER TABLE transfer_items DROP COLUMN IF EXISTS has_discrepancy;
ALTER TABLE transfer_items DROP COLUMN IF EXISTS received_quantity;
ALTER TABLE transfer_orders DROP COLUMN IF EXISTS cancel_reason;
ALTER TABLE transfer_orders DROP COLUMN IF EXISTS created_by;
ALTER TABLE transfer_orders DROP COLUMN IF EXISTS cancelled_by;
ALTER TABLE transfer_orders DROP COLUMN IF EXISTS approved_by;
ALTER TABLE transfer_orders DROP COLUMN IF EXISTS received_by;
ALTER TABLE transfer_orders DROP COLUMN IF EXISTS shipped_by;
ALTER TABLE transfer_orders DROP COLUMN IF EXISTS cancelled_date;
ALTER TABLE transfer_orders DROP COLUMN IF EXISTS approved_date;
ALTER TABLE transfer_orders DROP COLUMN IF EXISTS received_date;
ALTER TABLE transfer_orders DROP COLUMN IF EXISTS shipped_date;
ALTER TABLE transfer_orders DROP COLUMN IF EXISTS notes;
DROP INDEX IF EXISTS idx_transfer_orders_status;
