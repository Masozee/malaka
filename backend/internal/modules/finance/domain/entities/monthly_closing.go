package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// MonthlyClosing represents monthly financial closing entity.
type MonthlyClosing struct {
	types.BaseModel
	ClosingMonth   int       `json:"closing_month"`
	ClosingYear    int       `json:"closing_year"`
	ClosingDate    time.Time `json:"closing_date"`
	ClosedBy       string    `json:"closed_by"`
	Status         string    `json:"status"` // "open", "closed", "locked"
	OpeningBalance float64   `json:"opening_balance"`
	ClosingBalance float64   `json:"closing_balance"`
	TotalIncome    float64   `json:"total_income"`
	TotalExpense   float64   `json:"total_expense"`
	NetIncome      float64   `json:"net_income"`
	Description    string    `json:"description"`
	IsLocked       bool      `json:"is_locked"`
}