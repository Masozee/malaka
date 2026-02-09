package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
)

// CreateCompanyRequest represents the request body for creating a new company.
type CreateCompanyRequest struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
	Status  string `json:"status"`
}

// ToEntity converts CreateCompanyRequest to entities.Company.
func (r *CreateCompanyRequest) ToEntity() *entities.Company {
	company := &entities.Company{
		Name:    r.Name,
		Email:   r.Email,
		Phone:   r.Phone,
		Address: r.Address,
		Status:  r.Status,
	}

	// Set defaults
	if company.Status == "" {
		company.Status = "active"
	}

	return company
}

// UpdateCompanyRequest represents the request body for updating an existing company.
type UpdateCompanyRequest struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
	Status  string `json:"status"`
}

// ApplyToEntity applies UpdateCompanyRequest changes to an existing entities.Company.
func (r *UpdateCompanyRequest) ApplyToEntity(company *entities.Company) {
	if r.Name != "" {
		company.Name = r.Name
	}
	company.Email = r.Email
	company.Phone = r.Phone
	company.Address = r.Address
	if r.Status != "" {
		company.Status = r.Status
	}
}

// CompanyResponse represents the response body for a company.
type CompanyResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Address   string `json:"address"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// CompanyResponseFromEntity converts entities.Company to CompanyResponse.
func CompanyResponseFromEntity(company *entities.Company) *CompanyResponse {
	return &CompanyResponse{
		ID:        company.ID.String(),
		Name:      company.Name,
		Email:     company.Email,
		Phone:     company.Phone,
		Address:   company.Address,
		Status:    company.Status,
		CreatedAt: company.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: company.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
