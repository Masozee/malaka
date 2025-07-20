package entities

import (
	"malaka/internal/shared/types"
)

// PosItem represents a Point of Sale item entity.
type PosItem struct {
	types.BaseModel
	PosTransactionID string  `json:"pos_transaction_id"`
	ArticleID        string  `json:"article_id"`
	Quantity         int     `json:"quantity"`
	UnitPrice        float64 `json:"unit_price"`
	TotalPrice       float64 `json:"total_price"`
}
