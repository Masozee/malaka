package entities

import (
	"malaka/internal/shared/types"
)

// PurchaseOrderItem represents a purchase order item entity.
type PurchaseOrderItem struct {
	types.BaseModel
	PurchaseOrderID string  `json:"purchase_order_id"`
	ArticleID       string  `json:"article_id"`
	Quantity        int     `json:"quantity"`
	UnitPrice       float64 `json:"unit_price"`
	TotalPrice      float64 `json:"total_price"`
}
