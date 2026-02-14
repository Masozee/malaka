package dto

import (
	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// BudgetCreateRequest represents the request to create a budget.
type BudgetCreateRequest struct {
	Department string  `json:"department" binding:"required"`
	Category   string  `json:"category" binding:"required"`
	FiscalYear string  `json:"fiscal_year" binding:"required"`
	Allocated  float64 `json:"allocated"`
	Spent      float64 `json:"spent"`
	Status     string  `json:"status" binding:"required"`
	CompanyID  string  `json:"company_id"`
}

// BudgetUpdateRequest represents the request to update a budget.
type BudgetUpdateRequest struct {
	Department string  `json:"department"`
	Category   string  `json:"category"`
	FiscalYear string  `json:"fiscal_year"`
	Allocated  float64 `json:"allocated"`
	Spent      float64 `json:"spent"`
	Status     string  `json:"status"`
	CompanyID  string  `json:"company_id"`
}

// BudgetResponse represents the response for a budget.
type BudgetResponse struct {
	ID         string  `json:"id"`
	Department string  `json:"department"`
	Category   string  `json:"category"`
	FiscalYear string  `json:"fiscal_year"`
	Allocated  float64 `json:"allocated"`
	Spent      float64 `json:"spent"`
	Status     string  `json:"status"`
	CompanyID  string  `json:"company_id"`
	CreatedAt  string  `json:"created_at"`
	UpdatedAt  string  `json:"updated_at"`
}

// ToBudgetEntity converts BudgetCreateRequest to entities.Budget.
func (req *BudgetCreateRequest) ToBudgetEntity() *entities.Budget {
	return &entities.Budget{
		BaseModel:  types.BaseModel{},
		Department: req.Department,
		Category:   req.Category,
		FiscalYear: req.FiscalYear,
		Allocated:  req.Allocated,
		Spent:      req.Spent,
		Status:     req.Status,
		CompanyID:  req.CompanyID,
	}
}

// ToBudgetEntity converts BudgetUpdateRequest to entities.Budget.
func (req *BudgetUpdateRequest) ToBudgetEntity() *entities.Budget {
	return &entities.Budget{
		BaseModel:  types.BaseModel{},
		Department: req.Department,
		Category:   req.Category,
		FiscalYear: req.FiscalYear,
		Allocated:  req.Allocated,
		Spent:      req.Spent,
		Status:     req.Status,
		CompanyID:  req.CompanyID,
	}
}

// FromBudgetEntity converts entities.Budget to BudgetResponse.
func FromBudgetEntity(b *entities.Budget) *BudgetResponse {
	return &BudgetResponse{
		ID:         b.ID.String(),
		Department: b.Department,
		Category:   b.Category,
		FiscalYear: b.FiscalYear,
		Allocated:  b.Allocated,
		Spent:      b.Spent,
		Status:     b.Status,
		CompanyID:  b.CompanyID,
		CreatedAt:  b.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:  b.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
