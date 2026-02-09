package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
)

// CreateSupplierRequest represents the request body for creating a new supplier.
type CreateSupplierRequest struct {
	Name      string `json:"name" binding:"required"`
	Address   string `json:"address" binding:"required"`
	Contact   string `json:"contact" binding:"required"`
	CompanyID string `json:"company_id"`
}

// ToEntity converts CreateSupplierRequest to entities.Supplier.
func (r *CreateSupplierRequest) ToEntity() *entities.Supplier {
	return &entities.Supplier{
		Name:      r.Name,
		Address:   r.Address,
		Contact:   r.Contact,
		CompanyID: r.CompanyID,
	}
}

// UpdateSupplierRequest represents the request body for updating an existing supplier.
type UpdateSupplierRequest struct {
	Name      string `json:"name" binding:"required"`
	Address   string `json:"address" binding:"required"`
	Contact   string `json:"contact" binding:"required"`
	CompanyID string `json:"company_id"`
}

// ApplyToEntity applies UpdateSupplierRequest changes to an existing entities.Supplier.
func (r *UpdateSupplierRequest) ApplyToEntity(supplier *entities.Supplier) {
	if r.Name != "" {
		supplier.Name = r.Name
	}
	if r.Address != "" {
		supplier.Address = r.Address
	}
	if r.Contact != "" {
		supplier.Contact = r.Contact
	}
}

// SupplierResponse represents the response body for a supplier.
type SupplierResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Address   string `json:"address"`
	Contact   string `json:"contact"`
	CompanyID string `json:"company_id"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// SupplierResponseFromEntity converts entities.Supplier to SupplierResponse.
func SupplierResponseFromEntity(supplier *entities.Supplier) *SupplierResponse {
	return &SupplierResponse{
		ID:        supplier.ID.String(),
		Name:      supplier.Name,
		Address:   supplier.Address,
		Contact:   supplier.Contact,
		CompanyID: supplier.CompanyID,
		CreatedAt: supplier.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: supplier.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
