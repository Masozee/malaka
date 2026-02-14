package entities

import (
	"malaka/internal/shared/types"
)

// CashBook represents a cash/bank book entity (account registry).
type CashBook struct {
	types.BaseModel
	BookCode       string  `json:"book_code" db:"book_code"`
	BookName       string  `json:"book_name" db:"book_name"`
	BookType       string  `json:"book_type" db:"book_type"` // "CASH" or "BANK"
	AccountNumber  string  `json:"account_number" db:"account_number"`
	BankName       string  `json:"bank_name" db:"bank_name"`
	OpeningBalance float64 `json:"opening_balance" db:"opening_balance"`
	CurrentBalance float64 `json:"current_balance" db:"current_balance"`
	IsActive       bool    `json:"is_active" db:"is_active"`
}
