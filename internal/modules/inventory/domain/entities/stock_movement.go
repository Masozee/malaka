package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// StockMovement represents a stock movement entity.
type StockMovement struct {
	types.BaseModel
	ArticleID   string    `json:"article_id"`
	WarehouseID string    `json:"warehouse_id"`
	Quantity    int       `json:"quantity"`
	MovementType string    `json:"movement_type"` // e.g., "in", "out", "transfer"
	MovementDate time.Time `json:"movement_date"`
	ReferenceID string    `json:"reference_id"` // e.g., PO ID, SO ID
}
