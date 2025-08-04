package dto

import (
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// BudgetRequest represents the request structure for creating/updating a Budget
type BudgetRequest struct {
	CompanyID   string             `json:"company_id" binding:"required"`
	FiscalYear  int                `json:"fiscal_year" binding:"required"`
	BudgetType  entities.BudgetType `json:"budget_type" binding:"required"`
	Description string             `json:"description"`
	StartDate   time.Time          `json:"start_date" binding:"required"`
	EndDate     time.Time          `json:"end_date" binding:"required"`
	Status      entities.BudgetStatus `json:"status"`
	CreatedBy   string             `json:"created_by"`
	BudgetLines []BudgetLineRequest `json:"budget_lines"`
}

// BudgetLineRequest represents the request structure for a BudgetLine
type BudgetLineRequest struct {
	AccountID   uuid.UUID `json:"account_id" binding:"required"`
	Amount      float64   `json:"amount" binding:"required"`
	Description string    `json:"description"`
}

// BudgetResponse represents the response structure for a Budget
type BudgetResponse struct {
	ID          uuid.UUID          `json:"id"`
	CompanyID   string             `json:"company_id"`
	FiscalYear  int                `json:"fiscal_year"`
	BudgetType  entities.BudgetType `json:"budget_type"`
	Description string             `json:"description"`
	StartDate   time.Time          `json:"start_date"`
	EndDate     time.Time          `json:"end_date"`
	Status      entities.BudgetStatus `json:"status"`
	CreatedBy   string             `json:"created_by"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
	BudgetLines []BudgetLineResponse `json:"budget_lines"`
}

// BudgetLineResponse represents the response structure for a BudgetLine
type BudgetLineResponse struct {
	ID          uuid.UUID `json:"id"`
	BudgetID    uuid.UUID `json:"budget_id"`
	AccountID   uuid.UUID `json:"account_id"`
	Amount      float64   `json:"amount"`
	ActualAmount float64   `json:"actual_amount"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// MapBudgetEntityToResponse maps a Budget entity to its response DTO
func MapBudgetEntityToResponse(entity *entities.Budget) *BudgetResponse {
	if entity == nil {
		return nil
	}
	lines := make([]BudgetLineResponse, len(entity.Lines))
	for i, line := range entity.Lines {
		lines[i] = *MapBudgetLineEntityToResponse(&line)
	}
	return &BudgetResponse{
		ID:          entity.ID,
		CompanyID:   entity.CompanyID,
		FiscalYear:  entity.FiscalYear,
		BudgetType:  entity.BudgetType,
		Description: entity.Description,
		StartDate:   entity.PeriodStart,
		EndDate:     entity.PeriodEnd,
		Status:      entity.Status,
		CreatedBy:   entity.CreatedBy,
		CreatedAt:   entity.CreatedAt,
		UpdatedAt:   entity.UpdatedAt,
		BudgetLines: lines,
	}
}

// MapBudgetLineEntityToResponse maps a BudgetLine entity to its response DTO
func MapBudgetLineEntityToResponse(entity *entities.BudgetLine) *BudgetLineResponse {
	if entity == nil {
		return nil
	}
	return &BudgetLineResponse{
		ID:          entity.ID,
		BudgetID:    entity.BudgetID,
		AccountID:   entity.AccountID,
		Amount:      entity.BudgetedAmount,
		ActualAmount: entity.ActualAmount,
		Description: entity.Description,
		CreatedAt:   entity.CreatedAt,
		UpdatedAt:   entity.UpdatedAt,
	}
}

// MapBudgetRequestToEntity maps a BudgetRequest DTO to a Budget entity
func MapBudgetRequestToEntity(request *BudgetRequest) *entities.Budget {
	if request == nil {
		return nil
	}
	lines := make([]entities.BudgetLine, len(request.BudgetLines))
	for i, line := range request.BudgetLines {
		lines[i] = *MapBudgetLineRequestToEntity(&line)
	}
	return &entities.Budget{
		CompanyID:   request.CompanyID,
		FiscalYear:  request.FiscalYear,
		BudgetType:  request.BudgetType,
		Description: request.Description,
		PeriodStart: request.StartDate,
		PeriodEnd:   request.EndDate,
		Status:      request.Status,
		CreatedBy:   request.CreatedBy,
		Lines: lines,
	}
}

// MapBudgetLineRequestToEntity maps a BudgetLineRequest DTO to a BudgetLine entity
func MapBudgetLineRequestToEntity(request *BudgetLineRequest) *entities.BudgetLine {
	if request == nil {
		return nil
	}
	return &entities.BudgetLine{
		AccountID:   request.AccountID,
		BudgetedAmount: request.Amount,
		Description: request.Description,
	}
}
