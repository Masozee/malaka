package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
)

// CreateSizeRequest represents the request body for creating a new size.
type CreateSizeRequest struct {
	Code         string  `json:"code" binding:"required"`
	Name         string  `json:"name" binding:"required"`
	Description  *string `json:"description"`
	SizeCategory string  `json:"size_category"`
	SortOrder    int     `json:"sort_order"`
	CompanyID    string  `json:"company_id"`
	Status       string  `json:"status"`
}

// ToEntity converts CreateSizeRequest to entities.Size.
func (r *CreateSizeRequest) ToEntity() *entities.Size {
	size := &entities.Size{
		Code:         r.Code,
		Name:         r.Name,
		Description:  r.Description,
		SizeCategory: r.SizeCategory,
		SortOrder:    r.SortOrder,
		CompanyID:    r.CompanyID,
		Status:       r.Status,
	}

	// Set defaults
	if size.SizeCategory == "" {
		size.SizeCategory = "shoe"
	}
	if size.Status == "" {
		size.Status = "active"
	}

	return size
}

// UpdateSizeRequest represents the request body for updating an existing size.
type UpdateSizeRequest struct {
	Code         *string `json:"code"`
	Name         *string `json:"name"`
	Description  *string `json:"description"`
	SizeCategory *string `json:"size_category"`
	SortOrder    *int    `json:"sort_order"`
	Status       *string `json:"status"`
}

// ApplyToEntity applies UpdateSizeRequest changes to an existing entities.Size.
func (r *UpdateSizeRequest) ApplyToEntity(size *entities.Size) {
	if r.Code != nil {
		size.Code = *r.Code
	}
	if r.Name != nil {
		size.Name = *r.Name
	}
	if r.Description != nil {
		size.Description = r.Description
	}
	if r.SizeCategory != nil {
		size.SizeCategory = *r.SizeCategory
	}
	if r.SortOrder != nil {
		size.SortOrder = *r.SortOrder
	}
	if r.Status != nil {
		size.Status = *r.Status
	}
}

// SizeResponse represents the response body for a size.
type SizeResponse struct {
	ID           string  `json:"id"`
	Code         string  `json:"code"`
	Name         string  `json:"name"`
	Description  *string `json:"description,omitempty"`
	SizeCategory string  `json:"size_category"`
	SortOrder    int     `json:"sort_order"`
	CompanyID    string  `json:"company_id"`
	Status       string  `json:"status"`
	CreatedAt    string  `json:"created_at"`
	UpdatedAt    string  `json:"updated_at"`
}

// SizeResponseFromEntity converts entities.Size to SizeResponse.
func SizeResponseFromEntity(size *entities.Size) *SizeResponse {
	return &SizeResponse{
		ID:           size.ID.String(),
		Code:         size.Code,
		Name:         size.Name,
		Description:  size.Description,
		SizeCategory: size.SizeCategory,
		SortOrder:    size.SortOrder,
		CompanyID:    size.CompanyID,
		Status:       size.Status,
		CreatedAt:    size.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    size.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
