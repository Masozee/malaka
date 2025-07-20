package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// TransferOrder represents a stock transfer order entity.
type TransferOrder struct {
	types.BaseModel
	FromWarehouseID string    `json:"from_warehouse_id"`
	ToWarehouseID   string    `json:"to_warehouse_id"`
	OrderDate       time.Time `json:"order_date"`
	Status          string    `json:"status"`
}
