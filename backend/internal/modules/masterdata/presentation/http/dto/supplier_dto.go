package dto

// CreateSupplierRequest represents the request body for creating a new supplier.
type CreateSupplierRequest struct {
	Name    string `json:"name" binding:"required"`
	Address string `json:"address" binding:"required"`
	Contact string `json:"contact" binding:"required"`
}

// UpdateSupplierRequest represents the request body for updating an existing supplier.
type UpdateSupplierRequest struct {
	Name    string `json:"name" binding:"required"`
	Address string `json:"address" binding:"required"`
	Contact string `json:"contact" binding:"required"`
}
