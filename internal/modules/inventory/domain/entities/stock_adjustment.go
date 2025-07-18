package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// StockAdjustment represents a stock adjustment entity.
type StockAdjustment struct {
	types.BaseModel
	ArticleID   string    `json:"article_id"`
	WarehouseID string    `json:"warehouse_id"`
	Quantity    int       `json:"quantity"`
	AdjustmentDate time.Time `json:"adjustment_date"`
	Reason      string    `json:"reason"`
}
