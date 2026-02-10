package dto

import "time"

// CreateReturnSupplierRequest represents the request payload for creating a return supplier.
type CreateReturnSupplierRequest struct {
	SupplierID string    `json:"supplier_id" binding:"required"`
	ReturnDate time.Time `json:"return_date" binding:"required"`
	Reason     string    `json:"reason"`
	Status     string    `json:"status"`
	Notes      string    `json:"notes"`
	Items      []ReturnSupplierItemRequest `json:"items"`
}

// UpdateReturnSupplierRequest represents the request payload for updating a return supplier.
type UpdateReturnSupplierRequest struct {
	SupplierID string    `json:"supplier_id"`
	ReturnDate time.Time `json:"return_date"`
	Reason     string    `json:"reason"`
	Status     string    `json:"status"`
	Notes      string    `json:"notes"`
	Items      []ReturnSupplierItemRequest `json:"items"`
}

// ReturnSupplierItemRequest is an item in a return supplier request.
type ReturnSupplierItemRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required"`
	Notes     string `json:"notes"`
}

// ReturnSupplierResponse represents the response payload for return supplier operations.
type ReturnSupplierResponse struct {
	ID         string    `json:"id"`
	SupplierID string    `json:"supplier_id"`
	ReturnDate time.Time `json:"return_date"`
	Reason     string    `json:"reason"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// ReturnSupplierListResponse is the enriched response for list endpoints.
type ReturnSupplierListResponse struct {
	ID           string `json:"id"`
	ReturnNumber string `json:"returnNumber"`
	SupplierID   string `json:"supplierId"`
	SupplierName string `json:"supplierName"`
	ReturnDate   string `json:"returnDate"`
	Reason       string `json:"reason"`
	Status       string `json:"status"`
	Notes        string `json:"notes"`
	TotalItems   int    `json:"totalItems"`
	CreatedAt    string `json:"createdAt"`
	UpdatedAt    string `json:"updatedAt"`
}

// ReturnSupplierItemResponse is an item in a return supplier detail response.
type ReturnSupplierItemResponse struct {
	ID          string `json:"id"`
	ArticleID   string `json:"articleId"`
	ArticleName string `json:"articleName"`
	ArticleCode string `json:"articleCode"`
	Quantity    int    `json:"quantity"`
	Notes       string `json:"notes"`
}

// ReturnSupplierDetailResponse is the enriched detail response with items.
type ReturnSupplierDetailResponse struct {
	ReturnSupplierListResponse
	Items []ReturnSupplierItemResponse `json:"items"`
}
