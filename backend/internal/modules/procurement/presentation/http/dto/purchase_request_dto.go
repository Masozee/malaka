package dto

import "time"

// CreatePurchaseRequestRequest represents the request body for creating a purchase request.
type CreatePurchaseRequestRequest struct {
	Title        string                          `json:"title" binding:"required"`
	Description  string                          `json:"description"`
	RequesterID  string                          `json:"requester_id"`
	Department   string                          `json:"department" binding:"required"`
	Priority     string                          `json:"priority"`
	RequiredDate *time.Time                      `json:"required_date"`
	Currency     string                          `json:"currency"`
	Notes        string                          `json:"notes"`
	Items        []CreatePurchaseRequestItemDTO  `json:"items"`
}

// CreatePurchaseRequestItemDTO represents an item in a create purchase request.
type CreatePurchaseRequestItemDTO struct {
	ItemName       string  `json:"item_name" binding:"required"`
	Description    string  `json:"description"`
	Specification  string  `json:"specification"`
	Quantity       int     `json:"quantity" binding:"required,gt=0"`
	Unit           string  `json:"unit"`
	EstimatedPrice float64 `json:"estimated_price" binding:"required,gte=0"`
	Currency       string  `json:"currency"`
	SupplierID     string  `json:"supplier_id"`
}

// UpdatePurchaseRequestRequest represents the request body for updating a purchase request.
type UpdatePurchaseRequestRequest struct {
	Title        string                          `json:"title"`
	Description  string                          `json:"description"`
	Department   string                          `json:"department"`
	Priority     string                          `json:"priority"`
	RequiredDate *time.Time                      `json:"required_date"`
	Currency     string                          `json:"currency"`
	Notes        string                          `json:"notes"`
	Items        []UpdatePurchaseRequestItemDTO  `json:"items"`
}

// UpdatePurchaseRequestItemDTO represents an item in an update purchase request.
type UpdatePurchaseRequestItemDTO struct {
	ID             string  `json:"id"`
	ItemName       string  `json:"item_name"`
	Description    string  `json:"description"`
	Specification  string  `json:"specification"`
	Quantity       int     `json:"quantity"`
	Unit           string  `json:"unit"`
	EstimatedPrice float64 `json:"estimated_price"`
	Currency       string  `json:"currency"`
	SupplierID     string  `json:"supplier_id"`
}

// RejectPurchaseRequestRequest represents the request body for rejecting a purchase request.
type RejectPurchaseRequestRequest struct {
	Reason string `json:"reason" binding:"required"`
}

// AddPurchaseRequestItemRequest represents the request body for adding an item to a purchase request.
type AddPurchaseRequestItemRequest struct {
	ItemName       string  `json:"item_name" binding:"required"`
	Description    string  `json:"description"`
	Specification  string  `json:"specification"`
	Quantity       int     `json:"quantity" binding:"required,gt=0"`
	Unit           string  `json:"unit"`
	EstimatedPrice float64 `json:"estimated_price" binding:"required,gte=0"`
	Currency       string  `json:"currency"`
	SupplierID     string  `json:"supplier_id"`
}

// ConvertToPORequest represents the request body for converting a purchase request to a purchase order.
type ConvertToPORequest struct {
	SupplierID      string `json:"supplier_id" binding:"required"`
	DeliveryAddress string `json:"delivery_address" binding:"required"`
	PaymentTerms    string `json:"payment_terms" binding:"required"`
}

// PurchaseRequestListResponse represents a paginated list of purchase requests.
type PurchaseRequestListResponse struct {
	Data       interface{} `json:"data"`
	Pagination Pagination  `json:"pagination"`
}

// Pagination represents pagination information.
type Pagination struct {
	Page      int `json:"page"`
	Limit     int `json:"limit"`
	TotalRows int `json:"total_rows"`
}
