package dto

// CreateCustomerRequest represents the request body for creating a new customer.
type CreateCustomerRequest struct {
	Name    string `json:"name" binding:"required"`
	Address string `json:"address" binding:"required"`
	Contact string `json:"contact" binding:"required"`
}

// UpdateCustomerRequest represents the request body for updating an existing customer.
type UpdateCustomerRequest struct {
	Name    string `json:"name" binding:"required"`
	Address string `json:"address" binding:"required"`
	Contact string `json:"contact" binding:"required"`
}
