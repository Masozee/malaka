package entities

import (
	"malaka/internal/shared/types"
)

// CashBank represents a cash/bank account entity.
type CashBank struct {
	types.BaseModel
	Name    string  `json:"name"`
	AccountNo string  `json:"account_no"`
	Balance float64 `json:"balance"`
	Currency string  `json:"currency"`
}
