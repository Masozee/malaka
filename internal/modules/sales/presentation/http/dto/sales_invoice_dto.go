package dto

// CreateSalesInvoiceItemRequest represents a single item in a sales invoice creation request.
type CreateSalesInvoiceItemRequest struct {
	ArticleID string  `json:"article_id" binding:"required"`
	Quantity  int     `json:"quantity" binding:"required,gt=0"`
	UnitPrice float64 `json:"unit_price" binding:"required,gt=0"`
	TotalPrice float64 `json:"total_price" binding:"required,gt=0"`
}

// CreateSalesInvoiceRequest represents the request body for creating a new sales invoice.
type CreateSalesInvoiceRequest struct {
	SalesOrderID string                            `json:"sales_order_id" binding:"required"`
	TotalAmount  float64                           `json:"total_amount" binding:"required,gt=0"`
	Items        []CreateSalesInvoiceItemRequest `json:"items" binding:"required,min=1"`
}

// UpdateSalesInvoiceRequest represents the request body for updating an existing sales invoice.
type UpdateSalesInvoiceRequest struct {
	SalesOrderID string  `json:"sales_order_id" binding:"required"`
	TotalAmount  float64 `json:"total_amount" binding:"required,gt=0"`
}
