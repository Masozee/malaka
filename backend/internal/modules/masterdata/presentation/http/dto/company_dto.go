package dto

// CreateCompanyRequest represents the request body for creating a new company.
type CreateCompanyRequest struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
	Status  string `json:"status"`
}

// UpdateCompanyRequest represents the request body for updating an existing company.
type UpdateCompanyRequest struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
	Status  string `json:"status"`
}
