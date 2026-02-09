package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// TransferOrder represents a stock transfer order entity.
type TransferOrder struct {
	types.BaseModel
	FromWarehouseID uuid.ID   `json:"from_warehouse_id" db:"from_warehouse_id"`
	ToWarehouseID   uuid.ID   `json:"to_warehouse_id" db:"to_warehouse_id"`
	OrderDate       time.Time `json:"order_date" db:"order_date"`
	Status          string    `json:"status" db:"status"`
}
