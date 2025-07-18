package dto

// CreateGoodsReceiptRequest represents the request body for creating a new goods receipt.
type CreateGoodsReceiptRequest struct {
	PurchaseOrderID string `json:"purchase_order_id" binding:"required"`
	WarehouseID     string `json:"warehouse_id" binding:"required"`
}

// UpdateGoodsReceiptRequest represents the request body for updating an existing goods receipt.
type UpdateGoodsReceiptRequest struct {
	PurchaseOrderID string `json:"purchase_order_id" binding:"required"`
	WarehouseID     string `json:"warehouse_id" binding:"required"`
}
