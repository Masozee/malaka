package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CreateCustomerRequest represents the request body for creating a new customer.
type CreateCustomerRequest struct {
	Name          string `json:"name" binding:"required"`
	ContactPerson string `json:"contact_person"`
	Email         string `json:"email" binding:"required,email"`
	Phone         string `json:"phone"`
	CompanyID     string `json:"company_id" binding:"required"`
	Status        string `json:"status" binding:"required,oneof=active inactive"`
}

// ToEntity converts CreateCustomerRequest to entities.Customer.
func (r *CreateCustomerRequest) ToEntity() *entities.Customer {
	customer := &entities.Customer{
		Name:          r.Name,
		ContactPerson: r.ContactPerson,
		Email:         r.Email,
		Phone:         r.Phone,
		Status:        r.Status,
	}

	// Set defaults
	if customer.Status == "" {
		customer.Status = "active"
	}

	// Parse UUID field
	if r.CompanyID != "" {
		if id, err := uuid.Parse(r.CompanyID); err == nil {
			customer.CompanyID = id
		}
	}

	return customer
}

// UpdateCustomerRequest represents the request body for updating an existing customer.
type UpdateCustomerRequest struct {
	Name          string `json:"name"`
	ContactPerson string `json:"contact_person"`
	Email         string `json:"email" binding:"omitempty,email"`
	Phone         string `json:"phone"`
	CompanyID     string `json:"company_id"`
	Status        string `json:"status" binding:"omitempty,oneof=active inactive"`
}

// ApplyToEntity applies UpdateCustomerRequest changes to an existing entities.Customer.
func (r *UpdateCustomerRequest) ApplyToEntity(customer *entities.Customer) {
	if r.Name != "" {
		customer.Name = r.Name
	}
	customer.ContactPerson = r.ContactPerson
	if r.Email != "" {
		customer.Email = r.Email
	}
	customer.Phone = r.Phone
	if r.CompanyID != "" {
		if id, err := uuid.Parse(r.CompanyID); err == nil {
			customer.CompanyID = id
		}
	}
	if r.Status != "" {
		customer.Status = r.Status
	}
}

// CustomerResponse represents the response body for a customer.
type CustomerResponse struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	ContactPerson string `json:"contact_person"`
	Email         string `json:"email"`
	Phone         string `json:"phone"`
	CompanyID     string `json:"company_id"`
	Status        string `json:"status"`
	CreatedAt     string `json:"created_at"`
	UpdatedAt     string `json:"updated_at"`
}

// CustomerResponseFromEntity converts entities.Customer to CustomerResponse.
func CustomerResponseFromEntity(customer *entities.Customer) *CustomerResponse {
	return &CustomerResponse{
		ID:            customer.ID.String(),
		Name:          customer.Name,
		ContactPerson: customer.ContactPerson,
		Email:         customer.Email,
		Phone:         customer.Phone,
		CompanyID:     customer.CompanyID.String(),
		Status:        customer.Status,
		CreatedAt:     customer.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:     customer.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
