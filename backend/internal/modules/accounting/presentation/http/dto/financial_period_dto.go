package dto

import (
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// FinancialPeriodRequest represents the request structure for creating/updating a FinancialPeriod
type FinancialPeriodRequest struct {
	CompanyID   string    `json:"company_id" binding:"required"`
	PeriodName  string    `json:"period_name" binding:"required"`
	FiscalYear  int       `json:"fiscal_year" binding:"required"`
	PeriodMonth int       `json:"period_month"`
	StartDate   time.Time `json:"start_date" binding:"required"`
	EndDate     time.Time `json:"end_date" binding:"required"`
}

// FinancialPeriodResponse represents the response structure for a FinancialPeriod
type FinancialPeriodResponse struct {
	ID          uuid.ID `json:"id"`
	CompanyID   string    `json:"company_id"`
	PeriodName  string    `json:"period_name"`
	FiscalYear  int       `json:"fiscal_year"`
	PeriodMonth int       `json:"period_month,omitempty"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	Status      string    `json:"status"`
	IsClosed    bool      `json:"is_closed"`
	ClosedBy    string    `json:"closed_by,omitempty"`
	ClosedAt    string    `json:"closed_at,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// MapFinancialPeriodEntityToResponse maps a FinancialPeriod entity to its response DTO
func MapFinancialPeriodEntityToResponse(entity *entities.FinancialPeriod) *FinancialPeriodResponse {
	if entity == nil {
		return nil
	}

	response := &FinancialPeriodResponse{
		ID:          entity.ID,
		CompanyID:   entity.CompanyID,
		PeriodName:  entity.PeriodName,
		FiscalYear:  entity.FiscalYear,
		PeriodMonth: entity.PeriodMonth,
		StartDate:   entity.StartDate,
		EndDate:     entity.EndDate,
		Status:      string(entity.Status),
		IsClosed:    entity.IsClosed,
		ClosedBy:    entity.ClosedBy,
		CreatedAt:   entity.CreatedAt,
		UpdatedAt:   entity.UpdatedAt,
	}

	if entity.ClosedAt != nil {
		response.ClosedAt = entity.ClosedAt.Format(time.RFC3339)
	}

	return response
}

// MapFinancialPeriodRequestToEntity maps a FinancialPeriodRequest DTO to a FinancialPeriod entity
func MapFinancialPeriodRequestToEntity(request *FinancialPeriodRequest) *entities.FinancialPeriod {
	if request == nil {
		return nil
	}

	return &entities.FinancialPeriod{
		CompanyID:   request.CompanyID,
		PeriodName:  request.PeriodName,
		FiscalYear:  request.FiscalYear,
		PeriodMonth: request.PeriodMonth,
		StartDate:   request.StartDate,
		EndDate:     request.EndDate,
		Status:      entities.FinancialPeriodStatusOpen,
		IsClosed:    false,
	}
}
