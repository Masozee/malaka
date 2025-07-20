package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// StockOpname represents a stock opname entity.
type StockOpname struct {
	types.BaseModel
	WarehouseID string    `json:"warehouse_id"`
	OpnameDate  time.Time `json:"opname_date"`
	Status      string    `json:"status"` // e.g., "pending", "completed"
}
