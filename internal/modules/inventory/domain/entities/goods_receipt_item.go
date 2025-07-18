package entities

import (
	"malaka/internal/shared/types"
)

// GoodsReceiptItem represents a goods receipt item entity.
type GoodsReceiptItem struct {
	types.BaseModel
	GoodsReceiptID string `json:"goods_receipt_id"`
	ArticleID      string `json:"article_id"`
	Quantity       int    `json:"quantity"`
}
