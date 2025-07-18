package dto

// CreateConsignmentSalesRequest represents the request body for creating new consignment sales.
type CreateConsignmentSalesRequest struct {
	ConsigneeID string  `json:"consignee_id" binding:"required"`
	TotalAmount float64 `json:"total_amount" binding:"required,gt=0"`
	Status      string  `json:"status" binding:"required"`
}

// UpdateConsignmentSalesRequest represents the request body for updating existing consignment sales.
type UpdateConsignmentSalesRequest struct {
	ConsigneeID string  `json:"consignee_id" binding:"required"`
	TotalAmount float64 `json:"total_amount" binding:"required,gt=0"`
	Status      string  `json:"status" binding:"required"`
}
