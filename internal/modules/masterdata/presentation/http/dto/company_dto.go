package dto

// CreateCompanyRequest represents the request body for creating a new company.
type CreateCompanyRequest struct {
	Name    string `json:"name" binding:"required"`
	Address string `json:"address" binding:"required"`
}

// UpdateCompanyRequest represents the request body for updating an existing company.
type UpdateCompanyRequest struct {
	Name    string `json:"name" binding:"required"`
	Address string `json:"address" binding:"required"`
}
