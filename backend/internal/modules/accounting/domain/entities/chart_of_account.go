package entities

import (
	"time"

	"github.com/google/uuid"
)

// ChartOfAccount represents a single account in the chart of accounts.
type ChartOfAccount struct {
	ID           uuid.UUID  `json:"id"`
	ParentID     *uuid.UUID `json:"parent_id"`
	AccountCode  string     `json:"account_code"`
	AccountName  string     `json:"account_name"`
	AccountType  string     `json:"account_type"`    // e.g., Asset, Liability, Equity, Revenue, Expense
	NormalBalance string     `json:"normal_balance"` // e.g., Debit, Credit
	Description  string     `json:"description"`
	IsActive     bool       `json:"is_active"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
