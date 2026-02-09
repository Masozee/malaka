package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// StockMovement represents a stock movement entity.
type StockMovement struct {
	types.BaseModel
	ArticleID    uuid.ID   `json:"article_id" db:"article_id"`
	WarehouseID  uuid.ID   `json:"warehouse_id" db:"warehouse_id"`
	Quantity     int       `json:"quantity" db:"quantity"`
	MovementType string    `json:"movement_type" db:"movement_type"` // e.g., "in", "out", "transfer"
	MovementDate time.Time `json:"movement_date" db:"movement_date"`
	ReferenceID  uuid.ID   `json:"reference_id" db:"reference_id"` // e.g., PO ID, SO ID
}
