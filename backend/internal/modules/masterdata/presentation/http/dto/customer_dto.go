package dto

// CreateCustomerRequest represents the request body for creating a new customer.
type CreateCustomerRequest struct {
	Name        string `json:"name" binding:"required"`
	ContactPerson string `json:"contact_person"`
	Email       string `json:"email" binding:"required,email"`
	Phone       string `json:"phone"`
	CompanyID   string `json:"company_id" binding:"required"`
	Status      string `json:"status" binding:"required,oneof=active inactive"`
}

// UpdateCustomerRequest represents the request body for updating an existing customer.
type UpdateCustomerRequest struct {
	Name        string `json:"name"`
	ContactPerson string `json:"contact_person"`
	Email       string `json:"email" binding:"omitempty,email"`
	Phone       string `json:"phone"`
	CompanyID   string `json:"company_id"`
	Status      string `json:"status" binding:"omitempty,oneof=active inactive"`
}
