package dto

// CreatePosItemRequest represents a single item in a POS transaction creation request.
type CreatePosItemRequest struct {
	ArticleID string  `json:"article_id" binding:"required"`
	Quantity  int     `json:"quantity" binding:"required,gt=0"`
	UnitPrice float64 `json:"unit_price" binding:"required,gt=0"`
	TotalPrice float64 `json:"total_price" binding:"required,gt=0"`
}

// CreatePosTransactionRequest represents the request body for creating a new POS transaction.
type CreatePosTransactionRequest struct {
	TotalAmount   float64                `json:"total_amount" binding:"required,gt=0"`
	PaymentMethod string                 `json:"payment_method" binding:"required"`
	CashierID     string                 `json:"cashier_id" binding:"required"`
	Items         []CreatePosItemRequest `json:"items" binding:"required,min=1"`
}

// UpdatePosTransactionRequest represents the request body for updating an existing POS transaction.
type UpdatePosTransactionRequest struct {
	TotalAmount   float64 `json:"total_amount" binding:"required,gt=0"`
	PaymentMethod string  `json:"payment_method" binding:"required"`
	CashierID     string  `json:"cashier_id" binding:"required"`
}
