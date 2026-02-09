package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
)

// CreateColorRequest represents the request body for creating a new color.
type CreateColorRequest struct {
	Code        string `json:"code" binding:"required"`
	Name        string `json:"name" binding:"required"`
	HexCode     string `json:"hex_code" binding:"required"`
	Description string `json:"description"`
	CompanyID   string `json:"company_id"`
	Status      string `json:"status"`
}

// ToEntity converts CreateColorRequest to entities.Color.
func (r *CreateColorRequest) ToEntity() *entities.Color {
	color := &entities.Color{
		Code:        r.Code,
		Name:        r.Name,
		HexCode:     r.HexCode,
		Description: r.Description,
		CompanyID:   r.CompanyID,
		Status:      r.Status,
	}

	// Set defaults
	if color.Status == "" {
		color.Status = "active"
	}

	return color
}

// UpdateColorRequest represents the request body for updating an existing color.
type UpdateColorRequest struct {
	Code        string `json:"code" binding:"required"`
	Name        string `json:"name" binding:"required"`
	HexCode     string `json:"hex_code" binding:"required"`
	Description string `json:"description"`
	CompanyID   string `json:"company_id"`
	Status      string `json:"status"`
}

// ApplyToEntity applies UpdateColorRequest changes to an existing entities.Color.
func (r *UpdateColorRequest) ApplyToEntity(color *entities.Color) {
	if r.Code != "" {
		color.Code = r.Code
	}
	if r.Name != "" {
		color.Name = r.Name
	}
	if r.HexCode != "" {
		color.HexCode = r.HexCode
	}
	color.Description = r.Description
	if r.Status != "" {
		color.Status = r.Status
	}
}

// ColorResponse represents the response body for a color.
type ColorResponse struct {
	ID          string `json:"id"`
	Code        string `json:"code"`
	Name        string `json:"name"`
	HexCode     string `json:"hex_code"`
	Description string `json:"description"`
	CompanyID   string `json:"company_id"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

// ColorResponseFromEntity converts entities.Color to ColorResponse.
func ColorResponseFromEntity(color *entities.Color) *ColorResponse {
	return &ColorResponse{
		ID:          color.ID.String(),
		Code:        color.Code,
		Name:        color.Name,
		HexCode:     color.HexCode,
		Description: color.Description,
		CompanyID:   color.CompanyID,
		Status:      color.Status,
		CreatedAt:   color.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   color.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
