package entities

import (
	"malaka/internal/shared/types"
)

// StockBalance represents a stock balance entity.
type StockBalance struct {
	types.BaseModel
	ArticleID   string `json:"article_id"`
	WarehouseID string `json:"warehouse_id"`
	Quantity    int    `json:"quantity"`
}
