package dto

// CreateSalesReturnRequest represents the request body for creating a new sales return.
type CreateSalesReturnRequest struct {
	SalesInvoiceID string  `json:"sales_invoice_id" binding:"required"`
	Reason         string  `json:"reason" binding:"required"`
	TotalAmount    float64 `json:"total_amount" binding:"required,gt=0"`
}

// UpdateSalesReturnRequest represents the request body for updating an existing sales return.
type UpdateSalesReturnRequest struct {
	SalesInvoiceID string  `json:"sales_invoice_id" binding:"required"`
	Reason         string  `json:"reason" binding:"required"`
	TotalAmount    float64 `json:"total_amount" binding:"required,gt=0"`
}
