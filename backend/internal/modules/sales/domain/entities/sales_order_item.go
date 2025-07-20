package entities

import (
	"malaka/internal/shared/types"
)

// SalesOrderItem represents a sales order item entity.
type SalesOrderItem struct {
	types.BaseModel
	SalesOrderID string  `json:"sales_order_id"`
	ArticleID    string  `json:"article_id"`
	Quantity     int     `json:"quantity"`
	UnitPrice    float64 `json:"unit_price"`
	TotalPrice   float64 `json:"total_price"`
}
