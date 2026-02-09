package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CreateModelRequest represents the request body for creating a new model.
type CreateModelRequest struct {
	Code        string  `json:"code" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description,omitempty"`
	ArticleID   *string `json:"article_id,omitempty"`
	CompanyID   string  `json:"company_id"`
	Status      string  `json:"status"`
}

// ToEntity converts CreateModelRequest to entities.Model.
func (r *CreateModelRequest) ToEntity() *entities.Model {
	model := &entities.Model{
		Code:        r.Code,
		Name:        r.Name,
		Description: r.Description,
		CompanyID:   r.CompanyID,
		Status:      r.Status,
	}

	// Set defaults
	if model.Status == "" {
		model.Status = "active"
	}

	// Handle ArticleID - convert string to *uuid.ID
	if r.ArticleID != nil && *r.ArticleID != "" {
		if id, err := uuid.Parse(*r.ArticleID); err == nil {
			model.ArticleID = &id
		}
	}

	return model
}

// UpdateModelRequest represents the request body for updating an existing model.
type UpdateModelRequest struct {
	Code        string  `json:"code" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description,omitempty"`
	ArticleID   *string `json:"article_id,omitempty"`
	Status      string  `json:"status"`
}

// ApplyToEntity applies UpdateModelRequest changes to an existing entities.Model.
func (r *UpdateModelRequest) ApplyToEntity(model *entities.Model) {
	if r.Code != "" {
		model.Code = r.Code
	}
	if r.Name != "" {
		model.Name = r.Name
	}
	if r.Description != nil {
		model.Description = r.Description
	}
	if r.ArticleID != nil {
		if *r.ArticleID == "" {
			model.ArticleID = nil
		} else {
			if id, err := uuid.Parse(*r.ArticleID); err == nil {
				model.ArticleID = &id
			}
		}
	}
	if r.Status != "" {
		model.Status = r.Status
	}
}

// ModelResponse represents the response body for a model.
type ModelResponse struct {
	ID          string  `json:"id"`
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	ArticleID   *string `json:"article_id,omitempty"`
	CompanyID   string  `json:"company_id"`
	Status      string  `json:"status"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

// ModelResponseFromEntity converts entities.Model to ModelResponse.
func ModelResponseFromEntity(model *entities.Model) *ModelResponse {
	resp := &ModelResponse{
		ID:          model.ID.String(),
		Code:        model.Code,
		Name:        model.Name,
		Description: model.Description,
		CompanyID:   model.CompanyID,
		Status:      model.Status,
		CreatedAt:   model.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   model.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	// Convert ArticleID from *uuid.ID to *string
	if model.ArticleID != nil {
		articleIDStr := model.ArticleID.String()
		resp.ArticleID = &articleIDStr
	}

	return resp
}
