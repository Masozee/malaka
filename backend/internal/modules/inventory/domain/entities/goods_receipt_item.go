package entities

import (
	"malaka/internal/shared/types"
)

// GoodsReceiptItem represents a goods receipt item entity.
type GoodsReceiptItem struct {
	types.BaseModel

	// GoodsReceiptID is the parent goods receipt
	GoodsReceiptID string `json:"goods_receipt_id" db:"goods_receipt_id"`

	// POItemID references the PO item from Procurement module
	POItemID string `json:"po_item_id" db:"po_item_id"`

	// ArticleID references the article from master data (optional)
	ArticleID string `json:"article_id" db:"article_id"`

	// ItemName is denormalized from PO item
	ItemName string `json:"item_name" db:"item_name"`

	// Description is denormalized from PO item
	Description string `json:"description,omitempty" db:"description"`

	// Quantity received
	Quantity int `json:"quantity" db:"quantity"`

	// Unit of measure
	Unit string `json:"unit" db:"unit"`

	// UnitPrice from the PO
	UnitPrice float64 `json:"unit_price" db:"unit_price"`

	// LineTotal is quantity * unit_price
	LineTotal float64 `json:"line_total" db:"line_total"`
}

// CalculateLineTotal calculates the line total for an item
func (i *GoodsReceiptItem) CalculateLineTotal() {
	i.LineTotal = float64(i.Quantity) * i.UnitPrice
}
