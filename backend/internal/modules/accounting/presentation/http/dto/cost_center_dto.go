package dto

import (
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// CostCenterRequest represents the request structure for creating/updating a CostCenter
type CostCenterRequest struct {
	CompanyID   string               `json:"company_id" binding:"required"`
	Code        string               `json:"code" binding:"required"`
	Name        string               `json:"name" binding:"required"`
	Description string               `json:"description"`
	Type        entities.CostCenterType `json:"type"`
	ManagerID   string               `json:"manager_id"`
	ParentID    *uuid.UUID           `json:"parent_id"`
	IsActive    bool                 `json:"is_active"`
}

// CostCenterResponse represents the response structure for a CostCenter
type CostCenterResponse struct {
	ID             uuid.UUID            `json:"id"`
	CompanyID      string               `json:"company_id"`
	Code           string               `json:"code"`
	Name           string               `json:"name"`
	Description    string               `json:"description"`
	Type           entities.CostCenterType `json:"type"`
	ManagerID      string               `json:"manager_id"`
	ParentID       *uuid.UUID           `json:"parent_id"`
	IsActive       bool                 `json:"is_active"`
	BudgetAmount   float64              `json:"budget_amount"`
	ActualAmount   float64              `json:"actual_amount"`
	VarianceAmount float64              `json:"variance_amount"`
	CreatedAt      time.Time            `json:"created_at"`
	UpdatedAt      time.Time            `json:"updated_at"`
}

// CostCenterAllocationRequest represents the request structure for creating/updating a CostCenterAllocation
type CostCenterAllocationRequest struct {
	CostCenterID uuid.UUID `json:"cost_center_id" binding:"required"`
	AccountID    uuid.UUID `json:"account_id" binding:"required"`
	Percentage   float64   `json:"percentage" binding:"required"`
	EffectiveDate time.Time `json:"effective_date" binding:"required"`
}

// CostCenterAllocationResponse represents the response structure for a CostCenterAllocation
type CostCenterAllocationResponse struct {
	ID           uuid.UUID `json:"id"`
	CostCenterID uuid.UUID `json:"cost_center_id"`
	AccountID    uuid.UUID `json:"account_id"`
	Percentage   float64   `json:"percentage"`
	EffectiveDate time.Time `json:"effective_date"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// MapCostCenterEntityToResponse maps a CostCenter entity to its response DTO
func MapCostCenterEntityToResponse(entity *entities.CostCenter) *CostCenterResponse {
	if entity == nil {
		return nil
	}
	return &CostCenterResponse{
		ID:             entity.ID,
		CompanyID:      entity.CompanyID,
		Code:           entity.CostCenterCode,
		Name:           entity.CostCenterName,
		Description:    entity.Description,
		Type:           entity.CostCenterType,
		ManagerID:      entity.ManagerID,
		ParentID:       entity.ParentID,
		IsActive:       entity.IsActive,
		BudgetAmount:   entity.BudgetAmount,
		ActualAmount:   entity.ActualAmount,
		VarianceAmount: entity.VarianceAmount,
		CreatedAt:      entity.CreatedAt,
		UpdatedAt:      entity.UpdatedAt,
	}
}

// MapCostCenterRequestToEntity maps a CostCenterRequest DTO to a CostCenter entity
func MapCostCenterRequestToEntity(request *CostCenterRequest) *entities.CostCenter {
	if request == nil {
		return nil
	}
	return &entities.CostCenter{
		CompanyID:   request.CompanyID,
		CostCenterCode: request.Code,
		CostCenterName: request.Name,
		Description: request.Description,
		CostCenterType: request.Type,
		ManagerID:   request.ManagerID,
		ParentID:    request.ParentID,
		IsActive:    request.IsActive,
		// Set default values for enhanced fields
		BudgetAmount: 0,
		ActualAmount: 0,
		VarianceAmount: 0,
	}
}

// MapCostCenterAllocationEntityToResponse maps a CostCenterAllocation entity to its response DTO
func MapCostCenterAllocationEntityToResponse(entity *entities.CostCenterAllocation) *CostCenterAllocationResponse {
	if entity == nil {
		return nil
	}
	return &CostCenterAllocationResponse{
		ID:           entity.ID,
		CostCenterID: entity.CostCenterID,
		AccountID:    entity.SourceCostCenterID,  // Using SourceCostCenterID as AccountID placeholder
		Percentage:   entity.AllocationValue,     // Using AllocationValue as Percentage
		EffectiveDate: entity.PeriodStart,        // Using PeriodStart as EffectiveDate
		CreatedAt:    entity.CreatedAt,
		UpdatedAt:    entity.UpdatedAt,
	}
}

// MapCostCenterAllocationRequestToEntity maps a CostCenterAllocationRequest DTO to a CostCenterAllocation entity
func MapCostCenterAllocationRequestToEntity(request *CostCenterAllocationRequest) *entities.CostCenterAllocation {
	if request == nil {
		return nil
	}
	return &entities.CostCenterAllocation{
		CostCenterID: request.CostCenterID,
		SourceCostCenterID: request.AccountID,    // Using AccountID as SourceCostCenterID placeholder
		AllocationValue: request.Percentage,      // Using Percentage as AllocationValue
		PeriodStart: request.EffectiveDate,       // Using EffectiveDate as PeriodStart
	}
}
