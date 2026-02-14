package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// CapexProjectCreateRequest represents the request to create a capex project.
type CapexProjectCreateRequest struct {
	ProjectName    string    `json:"project_name" binding:"required"`
	Description    string    `json:"description"`
	Category       string    `json:"category" binding:"required"`
	EstBudget      float64   `json:"est_budget"`
	ActualSpent    float64   `json:"actual_spent"`
	ExpectedRoi    float64   `json:"expected_roi"`
	Status         string    `json:"status" binding:"required"`
	Priority       string    `json:"priority" binding:"required"`
	StartDate      time.Time `json:"start_date"`
	CompletionDate time.Time `json:"completion_date"`
	CompanyID      string    `json:"company_id"`
}

// CapexProjectUpdateRequest represents the request to update a capex project.
type CapexProjectUpdateRequest struct {
	ProjectName    string    `json:"project_name"`
	Description    string    `json:"description"`
	Category       string    `json:"category"`
	EstBudget      float64   `json:"est_budget"`
	ActualSpent    float64   `json:"actual_spent"`
	ExpectedRoi    float64   `json:"expected_roi"`
	Status         string    `json:"status"`
	Priority       string    `json:"priority"`
	StartDate      time.Time `json:"start_date"`
	CompletionDate time.Time `json:"completion_date"`
	CompanyID      string    `json:"company_id"`
}

// CapexProjectResponse represents the response for a capex project.
type CapexProjectResponse struct {
	ID             string  `json:"id"`
	ProjectName    string  `json:"project_name"`
	Description    string  `json:"description"`
	Category       string  `json:"category"`
	EstBudget      float64 `json:"est_budget"`
	ActualSpent    float64 `json:"actual_spent"`
	ExpectedRoi    float64 `json:"expected_roi"`
	Status         string  `json:"status"`
	Priority       string  `json:"priority"`
	StartDate      string  `json:"start_date"`
	CompletionDate string  `json:"completion_date"`
	CompanyID      string  `json:"company_id"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

// ToCapexProjectEntity converts CapexProjectCreateRequest to entities.CapexProject.
func (req *CapexProjectCreateRequest) ToCapexProjectEntity() *entities.CapexProject {
	return &entities.CapexProject{
		BaseModel:      types.BaseModel{},
		ProjectName:    req.ProjectName,
		Description:    req.Description,
		Category:       req.Category,
		EstBudget:      req.EstBudget,
		ActualSpent:    req.ActualSpent,
		ExpectedRoi:    req.ExpectedRoi,
		Status:         req.Status,
		Priority:       req.Priority,
		StartDate:      req.StartDate,
		CompletionDate: req.CompletionDate,
		CompanyID:      req.CompanyID,
	}
}

// ToCapexProjectEntity converts CapexProjectUpdateRequest to entities.CapexProject.
func (req *CapexProjectUpdateRequest) ToCapexProjectEntity() *entities.CapexProject {
	return &entities.CapexProject{
		BaseModel:      types.BaseModel{},
		ProjectName:    req.ProjectName,
		Description:    req.Description,
		Category:       req.Category,
		EstBudget:      req.EstBudget,
		ActualSpent:    req.ActualSpent,
		ExpectedRoi:    req.ExpectedRoi,
		Status:         req.Status,
		Priority:       req.Priority,
		StartDate:      req.StartDate,
		CompletionDate: req.CompletionDate,
		CompanyID:      req.CompanyID,
	}
}

// FromCapexProjectEntity converts entities.CapexProject to CapexProjectResponse.
func FromCapexProjectEntity(cp *entities.CapexProject) *CapexProjectResponse {
	return &CapexProjectResponse{
		ID:             cp.ID.String(),
		ProjectName:    cp.ProjectName,
		Description:    cp.Description,
		Category:       cp.Category,
		EstBudget:      cp.EstBudget,
		ActualSpent:    cp.ActualSpent,
		ExpectedRoi:    cp.ExpectedRoi,
		Status:         cp.Status,
		Priority:       cp.Priority,
		StartDate:      cp.StartDate.Format("2006-01-02T15:04:05Z"),
		CompletionDate: cp.CompletionDate.Format("2006-01-02T15:04:05Z"),
		CompanyID:      cp.CompanyID,
		CreatedAt:      cp.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:      cp.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
