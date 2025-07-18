package dto

// CreateTransferOrderItemRequest represents a single item in a transfer order creation request.
type CreateTransferOrderItemRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,gt=0"`
}

// CreateTransferOrderRequest represents the request body for creating a new transfer order.
type CreateTransferOrderRequest struct {
	FromWarehouseID string                           `json:"from_warehouse_id" binding:"required"`
	ToWarehouseID   string                           `json:"to_warehouse_id" binding:"required"`
	Items           []CreateTransferOrderItemRequest `json:"items" binding:"required,min=1"`
}

// UpdateTransferOrderRequest represents the request body for updating an existing transfer order.
type UpdateTransferOrderRequest struct {
	FromWarehouseID string `json:"from_warehouse_id" binding:"required"`
	ToWarehouseID   string `json:"to_warehouse_id" binding:"required"`
	Status          string `json:"status" binding:"required"`
}
