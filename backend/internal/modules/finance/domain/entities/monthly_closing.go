package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// MonthlyClosing represents monthly financial closing entity.
type MonthlyClosing struct {
	ID                 uuid.ID   `json:"id" db:"id"`
	PeriodYear         int       `json:"period_year" db:"period_year"`
	PeriodMonth        int       `json:"period_month" db:"period_month"`
	ClosingDate        time.Time `json:"closing_date" db:"closing_date"`
	TotalRevenue       float64   `json:"total_revenue" db:"total_revenue"`
	TotalExpenses      float64   `json:"total_expenses" db:"total_expenses"`
	NetIncome          float64   `json:"net_income" db:"net_income"`
	CashPosition       float64   `json:"cash_position" db:"cash_position"`
	BankPosition       float64   `json:"bank_position" db:"bank_position"`
	AccountsReceivable float64   `json:"accounts_receivable" db:"accounts_receivable"`
	AccountsPayable    float64   `json:"accounts_payable" db:"accounts_payable"`
	InventoryValue     float64   `json:"inventory_value" db:"inventory_value"`
	Status             string    `json:"status" db:"status"`
	ClosedBy           uuid.ID   `json:"closed_by" db:"closed_by"`
	ClosedAt           time.Time `json:"closed_at" db:"closed_at"`
	CreatedAt          time.Time `json:"created_at" db:"created_at"`
}
