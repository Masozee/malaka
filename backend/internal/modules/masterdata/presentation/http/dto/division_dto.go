package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CreateDivisionRequest represents the request body for creating a new division.
type CreateDivisionRequest struct {
	Code        string  `json:"code" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	ParentID    *string `json:"parent_id"`
	Level       int     `json:"level" binding:"required,min=0"`
	SortOrder   int     `json:"sort_order" binding:"required,min=0"`
	CompanyID   string  `json:"company_id"`
	Status      string  `json:"status" binding:"required,oneof=active inactive"`
}

// ToEntity converts CreateDivisionRequest to entities.Division.
func (r *CreateDivisionRequest) ToEntity() *entities.Division {
	division := &entities.Division{
		Code:        r.Code,
		Name:        r.Name,
		Description: r.Description,
		Level:       r.Level,
		SortOrder:   r.SortOrder,
		CompanyID:   r.CompanyID,
		Status:      r.Status,
	}

	// Set defaults
	if division.Status == "" {
		division.Status = "active"
	}

	// Generate new UUID
	division.ID = uuid.New()

	// Handle ParentID - convert string to *uuid.ID
	if r.ParentID != nil && *r.ParentID != "" {
		if id, err := uuid.Parse(*r.ParentID); err == nil {
			division.ParentID = &id
		}
	}

	return division
}

// UpdateDivisionRequest represents the request body for updating an existing division.
type UpdateDivisionRequest struct {
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	ParentID    *string `json:"parent_id"`
	Level       int     `json:"level" binding:"omitempty,min=0"`
	SortOrder   int     `json:"sort_order" binding:"omitempty,min=0"`
	Status      string  `json:"status" binding:"omitempty,oneof=active inactive"`
}

// ApplyToEntity applies UpdateDivisionRequest changes to an existing entities.Division.
func (r *UpdateDivisionRequest) ApplyToEntity(division *entities.Division) {
	if r.Code != "" {
		division.Code = r.Code
	}
	if r.Name != "" {
		division.Name = r.Name
	}
	division.Description = r.Description
	if r.ParentID != nil {
		if *r.ParentID == "" {
			division.ParentID = nil
		} else {
			if id, err := uuid.Parse(*r.ParentID); err == nil {
				division.ParentID = &id
			}
		}
	}
	if r.Level != 0 {
		division.Level = r.Level
	}
	if r.SortOrder != 0 {
		division.SortOrder = r.SortOrder
	}
	if r.Status != "" {
		division.Status = r.Status
	}
}

// DivisionResponse represents the response body for division operations.
type DivisionResponse struct {
	ID          string  `json:"id"`
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	ParentID    *string `json:"parent_id,omitempty"`
	Level       int     `json:"level"`
	SortOrder   int     `json:"sort_order"`
	CompanyID   string  `json:"company_id"`
	Status      string  `json:"status"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

// DivisionResponseFromEntity converts entities.Division to DivisionResponse.
func DivisionResponseFromEntity(division *entities.Division) *DivisionResponse {
	resp := &DivisionResponse{
		ID:          division.ID.String(),
		Code:        division.Code,
		Name:        division.Name,
		Description: division.Description,
		Level:       division.Level,
		SortOrder:   division.SortOrder,
		CompanyID:   division.CompanyID,
		Status:      division.Status,
		CreatedAt:   division.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   division.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	// Convert ParentID from *uuid.ID to *string
	if division.ParentID != nil {
		parentIDStr := division.ParentID.String()
		resp.ParentID = &parentIDStr
	}

	return resp
}
