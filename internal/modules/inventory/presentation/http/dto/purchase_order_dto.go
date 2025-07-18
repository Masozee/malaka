package dto

// CreatePurchaseOrderRequest represents the request body for creating a new purchase order.
type CreatePurchaseOrderRequest struct {
	SupplierID  string  `json:"supplier_id" binding:"required"`
	TotalAmount float64 `json:"total_amount" binding:"required,gt=0"`
}

// UpdatePurchaseOrderRequest represents the request body for updating an existing purchase order.
type UpdatePurchaseOrderRequest struct {
	SupplierID  string  `json:"supplier_id" binding:"required"`
	Status      string  `json:"status" binding:"required"`
	TotalAmount float64 `json:"total_amount" binding:"required,gt=0"`
}
