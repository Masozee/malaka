package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// MonthlyClosing represents monthly financial closing entity.
type MonthlyClosing struct {
	types.BaseModel
	ClosingMonth   int       `json:"closing_month" db:"closing_month"`
	ClosingYear    int       `json:"closing_year" db:"closing_year"`
	ClosingDate    time.Time `json:"closing_date" db:"closing_date"`
	ClosedBy       uuid.ID   `json:"closed_by" db:"closed_by"`
	Status         string    `json:"status" db:"status"` // "open", "closed", "locked"
	OpeningBalance float64   `json:"opening_balance" db:"opening_balance"`
	ClosingBalance float64   `json:"closing_balance" db:"closing_balance"`
	TotalIncome    float64   `json:"total_income" db:"total_income"`
	TotalExpense   float64   `json:"total_expense" db:"total_expense"`
	NetIncome      float64   `json:"net_income" db:"net_income"`
	Description    string    `json:"description" db:"description"`
	IsLocked       bool      `json:"is_locked" db:"is_locked"`
}
