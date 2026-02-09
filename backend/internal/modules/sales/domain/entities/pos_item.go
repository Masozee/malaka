package entities

import (
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// PosItem represents a Point of Sale item entity.
type PosItem struct {
	types.BaseModel
	PosTransactionID uuid.ID `json:"pos_transaction_id" db:"pos_transaction_id"`
	ArticleID        uuid.ID `json:"article_id" db:"article_id"`
	Quantity         int     `json:"quantity" db:"quantity"`
	UnitPrice        float64 `json:"unit_price" db:"unit_price"`
	TotalPrice       float64 `json:"total_price" db:"total_price"`
}
