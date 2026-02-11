package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
)

// CreateSupplierRequest represents the request body for creating a new supplier.
type CreateSupplierRequest struct {
	Code          string  `json:"code"`
	Name          string  `json:"name" binding:"required"`
	Address       string  `json:"address"`
	Contact       string  `json:"contact"`
	ContactPerson string  `json:"contact_person"`
	Phone         string  `json:"phone"`
	Email         string  `json:"email"`
	Website       string  `json:"website"`
	TaxID         string  `json:"tax_id"`
	PaymentTerms  string  `json:"payment_terms"`
	CreditLimit   float64 `json:"credit_limit"`
	Status        string  `json:"status"`
	CompanyID     string  `json:"company_id"`
}

// ToEntity converts CreateSupplierRequest to entities.Supplier.
func (r *CreateSupplierRequest) ToEntity() *entities.Supplier {
	status := r.Status
	if status == "" {
		status = "active"
	}
	return &entities.Supplier{
		Code:          r.Code,
		Name:          r.Name,
		Address:       r.Address,
		Contact:       r.Contact,
		ContactPerson: r.ContactPerson,
		Phone:         r.Phone,
		Email:         r.Email,
		Website:       r.Website,
		TaxID:         r.TaxID,
		PaymentTerms:  r.PaymentTerms,
		CreditLimit:   r.CreditLimit,
		Status:        status,
		CompanyID:     r.CompanyID,
	}
}

// UpdateSupplierRequest represents the request body for updating an existing supplier.
type UpdateSupplierRequest struct {
	Code          string  `json:"code"`
	Name          string  `json:"name" binding:"required"`
	Address       string  `json:"address"`
	Contact       string  `json:"contact"`
	ContactPerson string  `json:"contact_person"`
	Phone         string  `json:"phone"`
	Email         string  `json:"email"`
	Website       string  `json:"website"`
	TaxID         string  `json:"tax_id"`
	PaymentTerms  string  `json:"payment_terms"`
	CreditLimit   float64 `json:"credit_limit"`
	Status        string  `json:"status"`
	CompanyID     string  `json:"company_id"`
}

// ApplyToEntity applies UpdateSupplierRequest changes to an existing entities.Supplier.
func (r *UpdateSupplierRequest) ApplyToEntity(supplier *entities.Supplier) {
	if r.Name != "" {
		supplier.Name = r.Name
	}
	supplier.Code = r.Code
	supplier.Address = r.Address
	supplier.Contact = r.Contact
	supplier.ContactPerson = r.ContactPerson
	supplier.Phone = r.Phone
	supplier.Email = r.Email
	supplier.Website = r.Website
	supplier.TaxID = r.TaxID
	supplier.PaymentTerms = r.PaymentTerms
	supplier.CreditLimit = r.CreditLimit
	if r.Status != "" {
		supplier.Status = r.Status
	}
	if r.CompanyID != "" {
		supplier.CompanyID = r.CompanyID
	}
}

// SupplierResponse represents the response body for a supplier.
type SupplierResponse struct {
	ID            string  `json:"id"`
	Code          string  `json:"code"`
	Name          string  `json:"name"`
	Address       string  `json:"address"`
	Contact       string  `json:"contact"`
	ContactPerson string  `json:"contact_person"`
	Phone         string  `json:"phone"`
	Email         string  `json:"email"`
	Website       string  `json:"website"`
	TaxID         string  `json:"tax_id"`
	PaymentTerms  string  `json:"payment_terms"`
	CreditLimit   float64 `json:"credit_limit"`
	Status        string  `json:"status"`
	CompanyID     string  `json:"company_id"`
	CreatedAt     string  `json:"created_at"`
	UpdatedAt     string  `json:"updated_at"`
}

// SupplierResponseFromEntity converts entities.Supplier to SupplierResponse.
func SupplierResponseFromEntity(supplier *entities.Supplier) *SupplierResponse {
	return &SupplierResponse{
		ID:            supplier.ID.String(),
		Code:          supplier.Code,
		Name:          supplier.Name,
		Address:       supplier.Address,
		Contact:       supplier.Contact,
		ContactPerson: supplier.ContactPerson,
		Phone:         supplier.Phone,
		Email:         supplier.Email,
		Website:       supplier.Website,
		TaxID:         supplier.TaxID,
		PaymentTerms:  supplier.PaymentTerms,
		CreditLimit:   supplier.CreditLimit,
		Status:        supplier.Status,
		CompanyID:     supplier.CompanyID,
		CreatedAt:     supplier.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:     supplier.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
