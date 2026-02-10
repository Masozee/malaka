package dto

import "time"

// CreateReturnSupplierRequest represents the request payload for creating a return supplier.
type CreateReturnSupplierRequest struct {
	SupplierID string    `json:"supplier_id" binding:"required"`
	ReturnDate time.Time `json:"return_date" binding:"required"`
	Reason     string    `json:"reason" binding:"required"`
}

// UpdateReturnSupplierRequest represents the request payload for updating a return supplier.
type UpdateReturnSupplierRequest struct {
	SupplierID string    `json:"supplier_id"`
	ReturnDate time.Time `json:"return_date"`
	Reason     string    `json:"reason"`
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

// ReturnSupplierListResponse is the enriched response for list/detail endpoints.
type ReturnSupplierListResponse struct {
	ID           string `json:"id"`
	ReturnNumber string `json:"returnNumber"`
	SupplierID   string `json:"supplierId"`
	SupplierName string `json:"supplierName"`
	ReturnDate   string `json:"returnDate"`
	Reason       string `json:"reason"`
	CreatedAt    string `json:"createdAt"`
	UpdatedAt    string `json:"updatedAt"`
}