package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CreateDepstoreRequest represents the request body for creating a new department store.
type CreateDepstoreRequest struct {
	Code           string  `json:"code" binding:"required"`
	Name           string  `json:"name" binding:"required"`
	Address        string  `json:"address" binding:"required"`
	City           string  `json:"city" binding:"required"`
	Phone          string  `json:"phone"`
	ContactPerson  string  `json:"contact_person"`
	CommissionRate float64 `json:"commission_rate" binding:"min=0,max=100"`
	PaymentTerms   string  `json:"payment_terms"`
	CompanyID      string  `json:"company_id"`
	Status         string  `json:"status" binding:"required,oneof=active inactive"`
}

// ToEntity converts CreateDepstoreRequest to entities.Depstore.
func (r *CreateDepstoreRequest) ToEntity() *entities.Depstore {
	depstore := &entities.Depstore{
		Code:           r.Code,
		Name:           r.Name,
		Address:        r.Address,
		City:           r.City,
		Phone:          r.Phone,
		ContactPerson:  r.ContactPerson,
		CommissionRate: r.CommissionRate,
		PaymentTerms:   r.PaymentTerms,
		CompanyID:      r.CompanyID,
		Status:         r.Status,
	}

	// Set defaults
	if depstore.Status == "" {
		depstore.Status = "active"
	}

	// Generate new UUID
	depstore.ID = uuid.New()

	return depstore
}

// UpdateDepstoreRequest represents the request body for updating an existing department store.
type UpdateDepstoreRequest struct {
	Code           string  `json:"code"`
	Name           string  `json:"name"`
	Address        string  `json:"address"`
	City           string  `json:"city"`
	Phone          string  `json:"phone"`
	ContactPerson  string  `json:"contact_person"`
	CommissionRate float64 `json:"commission_rate" binding:"omitempty,min=0,max=100"`
	PaymentTerms   string  `json:"payment_terms"`
	Status         string  `json:"status" binding:"omitempty,oneof=active inactive"`
}

// ApplyToEntity applies UpdateDepstoreRequest changes to an existing entities.Depstore.
func (r *UpdateDepstoreRequest) ApplyToEntity(depstore *entities.Depstore) {
	if r.Code != "" {
		depstore.Code = r.Code
	}
	if r.Name != "" {
		depstore.Name = r.Name
	}
	if r.Address != "" {
		depstore.Address = r.Address
	}
	if r.City != "" {
		depstore.City = r.City
	}
	depstore.Phone = r.Phone
	depstore.ContactPerson = r.ContactPerson
	if r.CommissionRate != 0 {
		depstore.CommissionRate = r.CommissionRate
	}
	depstore.PaymentTerms = r.PaymentTerms
	if r.Status != "" {
		depstore.Status = r.Status
	}
}

// DepstoreResponse represents the response body for department store operations.
type DepstoreResponse struct {
	ID             string  `json:"id"`
	Code           string  `json:"code"`
	Name           string  `json:"name"`
	Address        string  `json:"address"`
	City           string  `json:"city"`
	Phone          string  `json:"phone"`
	ContactPerson  string  `json:"contact_person"`
	CommissionRate float64 `json:"commission_rate"`
	PaymentTerms   string  `json:"payment_terms"`
	CompanyID      string  `json:"company_id"`
	Status         string  `json:"status"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

// DepstoreResponseFromEntity converts entities.Depstore to DepstoreResponse.
func DepstoreResponseFromEntity(depstore *entities.Depstore) *DepstoreResponse {
	return &DepstoreResponse{
		ID:             depstore.ID.String(),
		Code:           depstore.Code,
		Name:           depstore.Name,
		Address:        depstore.Address,
		City:           depstore.City,
		Phone:          depstore.Phone,
		ContactPerson:  depstore.ContactPerson,
		CommissionRate: depstore.CommissionRate,
		PaymentTerms:   depstore.PaymentTerms,
		CompanyID:      depstore.CompanyID,
		Status:         depstore.Status,
		CreatedAt:      depstore.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:      depstore.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
