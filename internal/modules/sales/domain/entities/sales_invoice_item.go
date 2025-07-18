package entities

import (
	"malaka/internal/shared/types"
)

// SalesInvoiceItem represents a sales invoice item entity.
type SalesInvoiceItem struct {
	types.BaseModel
	SalesInvoiceID string  `json:"sales_invoice_id"`
	ArticleID      string  `json:"article_id"`
	Quantity       int     `json:"quantity"`
	UnitPrice      float64 `json:"unit_price"`
	TotalPrice     float64 `json:"total_price"`
}
