package dto

// CreateOnlineOrderRequest represents the request body for creating a new online order.
type CreateOnlineOrderRequest struct {
	Marketplace   string  `json:"marketplace" binding:"required"`
	OrderID       string  `json:"order_id" binding:"required"`
	TotalAmount   float64 `json:"total_amount" binding:"required,gt=0"`
	Status        string  `json:"status" binding:"required"`
	CustomerID    string  `json:"customer_id" binding:"required"`
}

// UpdateOnlineOrderRequest represents the request body for updating an existing online order.
type UpdateOnlineOrderRequest struct {
	Marketplace   string  `json:"marketplace" binding:"required"`
	OrderID       string  `json:"order_id" binding:"required"`
	TotalAmount   float64 `json:"total_amount" binding:"required,gt=0"`
	Status        string  `json:"status" binding:"required"`
	CustomerID    string  `json:"customer_id" binding:"required"`
}
