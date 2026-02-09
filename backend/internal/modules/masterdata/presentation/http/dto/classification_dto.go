package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CreateClassificationRequest represents the request body for creating a new classification.
type CreateClassificationRequest struct {
	Code        string  `json:"code" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description"`
	ParentID    *string `json:"parent_id"`
	CompanyID   string  `json:"company_id"`
	Status      string  `json:"status"`
}

// ToEntity converts CreateClassificationRequest to entities.Classification.
func (r *CreateClassificationRequest) ToEntity() *entities.Classification {
	classification := &entities.Classification{
		Code:        r.Code,
		Name:        r.Name,
		Description: r.Description,
		CompanyID:   r.CompanyID,
		Status:      r.Status,
	}

	// Set defaults
	if classification.Status == "" {
		classification.Status = "active"
	}

	// Handle ParentID - convert string to *uuid.ID
	if r.ParentID != nil && *r.ParentID != "" {
		if id, err := uuid.Parse(*r.ParentID); err == nil {
			classification.ParentID = &id
		}
	}

	return classification
}

// UpdateClassificationRequest represents the request body for updating an existing classification.
type UpdateClassificationRequest struct {
	Code        *string `json:"code"`
	Name        *string `json:"name"`
	Description *string `json:"description"`
	ParentID    *string `json:"parent_id"`
	Status      *string `json:"status"`
}

// ApplyToEntity applies UpdateClassificationRequest changes to an existing entities.Classification.
func (r *UpdateClassificationRequest) ApplyToEntity(classification *entities.Classification) {
	if r.Code != nil {
		classification.Code = *r.Code
	}
	if r.Name != nil {
		classification.Name = *r.Name
	}
	if r.Description != nil {
		classification.Description = r.Description
	}
	if r.ParentID != nil {
		if *r.ParentID == "" {
			classification.ParentID = nil
		} else {
			if id, err := uuid.Parse(*r.ParentID); err == nil {
				classification.ParentID = &id
			}
		}
	}
	if r.Status != nil {
		classification.Status = *r.Status
	}
}

// ClassificationResponse represents the response body for a classification.
type ClassificationResponse struct {
	ID          string  `json:"id"`
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	ParentID    *string `json:"parent_id,omitempty"`
	CompanyID   string  `json:"company_id"`
	Status      string  `json:"status"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

// ClassificationResponseFromEntity converts entities.Classification to ClassificationResponse.
func ClassificationResponseFromEntity(classification *entities.Classification) *ClassificationResponse {
	resp := &ClassificationResponse{
		ID:          classification.ID.String(),
		Code:        classification.Code,
		Name:        classification.Name,
		Description: classification.Description,
		CompanyID:   classification.CompanyID,
		Status:      classification.Status,
		CreatedAt:   classification.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   classification.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	// Convert ParentID from *uuid.ID to *string
	if classification.ParentID != nil {
		parentIDStr := classification.ParentID.String()
		resp.ParentID = &parentIDStr
	}

	return resp
}
