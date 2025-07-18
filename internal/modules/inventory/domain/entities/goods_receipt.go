package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// GoodsReceipt represents a goods receipt entity.
type GoodsReceipt struct {
	types.BaseModel
	PurchaseOrderID string    `json:"purchase_order_id"`
	ReceiptDate     time.Time `json:"receipt_date"`
	WarehouseID     string    `json:"warehouse_id"`
}
