package entities

import (
	"malaka/internal/shared/types"
)

// TransferItem represents a stock transfer item entity.
type TransferItem struct {
	types.BaseModel
	TransferOrderID  string `json:"transfer_order_id"`
	ArticleID        string `json:"article_id"`
	Quantity         int    `json:"quantity"`
	ReceivedQuantity int    `json:"received_quantity"`
	HasDiscrepancy   bool   `json:"has_discrepancy"`
}
