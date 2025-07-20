package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
)

type CreateMonthlyClosingRequest struct {
	ClosingMonth   int     `json:"closing_month" binding:"required,min=1,max=12"`
	ClosingYear    int     `json:"closing_year" binding:"required,min=2020"`
	OpeningBalance float64 `json:"opening_balance" binding:"min=0"`
	ClosingBalance float64 `json:"closing_balance" binding:"min=0"`
	TotalIncome    float64 `json:"total_income" binding:"min=0"`
	TotalExpense   float64 `json:"total_expense" binding:"min=0"`
	Description    string  `json:"description"`
}

type UpdateMonthlyClosingRequest struct {
	ClosingMonth   int     `json:"closing_month" binding:"required,min=1,max=12"`
	ClosingYear    int     `json:"closing_year" binding:"required,min=2020"`
	OpeningBalance float64 `json:"opening_balance" binding:"min=0"`
	ClosingBalance float64 `json:"closing_balance" binding:"min=0"`
	TotalIncome    float64 `json:"total_income" binding:"min=0"`
	TotalExpense   float64 `json:"total_expense" binding:"min=0"`
	Status         string  `json:"status" binding:"required,oneof=open closed locked"`
	Description    string  `json:"description"`
}

type CloseMonthRequest struct {
	ClosedBy string `json:"closed_by" binding:"required"`
}

type MonthlyClosingResponse struct {
	ID             string    `json:"id"`
	ClosingMonth   int       `json:"closing_month"`
	ClosingYear    int       `json:"closing_year"`
	ClosingDate    time.Time `json:"closing_date"`
	ClosedBy       string    `json:"closed_by"`
	Status         string    `json:"status"`
	OpeningBalance float64   `json:"opening_balance"`
	ClosingBalance float64   `json:"closing_balance"`
	TotalIncome    float64   `json:"total_income"`
	TotalExpense   float64   `json:"total_expense"`
	NetIncome      float64   `json:"net_income"`
	Description    string    `json:"description"`
	IsLocked       bool      `json:"is_locked"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func ToMonthlyClosingResponse(closing *entities.MonthlyClosing) *MonthlyClosingResponse {
	return &MonthlyClosingResponse{
		ID:             closing.ID,
		ClosingMonth:   closing.ClosingMonth,
		ClosingYear:    closing.ClosingYear,
		ClosingDate:    closing.ClosingDate,
		ClosedBy:       closing.ClosedBy,
		Status:         closing.Status,
		OpeningBalance: closing.OpeningBalance,
		ClosingBalance: closing.ClosingBalance,
		TotalIncome:    closing.TotalIncome,
		TotalExpense:   closing.TotalExpense,
		NetIncome:      closing.NetIncome,
		Description:    closing.Description,
		IsLocked:       closing.IsLocked,
		CreatedAt:      closing.CreatedAt,
		UpdatedAt:      closing.UpdatedAt,
	}
}

func ToMonthlyClosingEntity(req *CreateMonthlyClosingRequest) *entities.MonthlyClosing {
	return &entities.MonthlyClosing{
		ClosingMonth:   req.ClosingMonth,
		ClosingYear:    req.ClosingYear,
		OpeningBalance: req.OpeningBalance,
		ClosingBalance: req.ClosingBalance,
		TotalIncome:    req.TotalIncome,
		TotalExpense:   req.TotalExpense,
		Description:    req.Description,
	}
}