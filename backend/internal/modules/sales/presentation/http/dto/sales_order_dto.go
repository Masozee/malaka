package dto

// CreateSalesOrderItemRequest represents a single item in a sales order creation request.
type CreateSalesOrderItemRequest struct {
	ArticleID string  `json:"article_id" binding:"required"`
	Quantity  int     `json:"quantity" binding:"required,gt=0"`
	UnitPrice float64 `json:"unit_price" binding:"required,gt=0"`
	TotalPrice float64 `json:"total_price" binding:"required,gt=0"`
}

// CreateSalesOrderRequest represents the request body for creating a new sales order.
type CreateSalesOrderRequest struct {
	CustomerID  string                            `json:"customer_id" binding:"required"`
	TotalAmount float64                           `json:"total_amount" binding:"required,gt=0"`
	Items       []CreateSalesOrderItemRequest `json:"items" binding:"required,min=1"`
}

// UpdateSalesOrderRequest represents the request body for updating an existing sales order.
type UpdateSalesOrderRequest struct {
	CustomerID  string  `json:"customer_id" binding:"required"`
	Status      string  `json:"status" binding:"required"`
	TotalAmount float64 `json:"total_amount" binding:"required,gt=0"`
}
