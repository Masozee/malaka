package entities

import (
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// StockBalance represents a stock balance entity.
type StockBalance struct {
	types.BaseModel
	ArticleID   uuid.ID `json:"article_id" db:"article_id"`
	WarehouseID uuid.ID `json:"warehouse_id" db:"warehouse_id"`
	Quantity    int     `json:"quantity" db:"quantity"`
}
