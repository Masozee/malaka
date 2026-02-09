package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// GeneralLedger represents a general ledger entry
type GeneralLedger struct {
	ID              uuid.ID `json:"id" db:"id"`
	AccountID       uuid.ID `json:"account_id" db:"account_id"`           // Foreign key to chart_of_accounts
	JournalEntryID  uuid.ID `json:"journal_entry_id" db:"journal_entry_id"` // Foreign key to journal_entries
	TransactionDate time.Time `json:"transaction_date" db:"transaction_date"`
	Description     string    `json:"description" db:"description"`
	Reference       string    `json:"reference" db:"reference"`               // Reference number/document
	DebitAmount     float64   `json:"debit_amount" db:"debit_amount"`
	CreditAmount    float64   `json:"credit_amount" db:"credit_amount"`
	Balance         float64   `json:"balance" db:"balance"`                   // Running balance
	CurrencyCode    string    `json:"currency_code" db:"currency_code"`
	ExchangeRate    float64   `json:"exchange_rate" db:"exchange_rate"`
	BaseDebitAmount float64   `json:"base_debit_amount" db:"base_debit_amount"`   // Amount in base currency
	BaseCreditAmount float64  `json:"base_credit_amount" db:"base_credit_amount"` // Amount in base currency
	CompanyID       string    `json:"company_id" db:"company_id"`
	CreatedBy       string    `json:"created_by" db:"created_by"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

// IsDebit returns true if this is a debit entry
func (gl *GeneralLedger) IsDebit() bool {
	return gl.DebitAmount > 0
}

// IsCredit returns true if this is a credit entry
func (gl *GeneralLedger) IsCredit() bool {
	return gl.CreditAmount > 0
}

// GetAmount returns the non-zero amount (debit or credit)
func (gl *GeneralLedger) GetAmount() float64 {
	if gl.IsDebit() {
		return gl.DebitAmount
	}
	return gl.CreditAmount
}

// GetBaseAmount returns the non-zero base currency amount
func (gl *GeneralLedger) GetBaseAmount() float64 {
	if gl.IsDebit() {
		return gl.BaseDebitAmount
	}
	return gl.BaseCreditAmount
}

// CalculateBaseAmounts calculates base currency amounts using exchange rate
func (gl *GeneralLedger) CalculateBaseAmounts() {
	gl.BaseDebitAmount = gl.DebitAmount / gl.ExchangeRate
	gl.BaseCreditAmount = gl.CreditAmount / gl.ExchangeRate
}

// Validate checks if the general ledger entry is valid
func (gl *GeneralLedger) Validate() error {
	if gl.AccountID.IsNil() {
		return NewValidationError("account_id is required")
	}
	if gl.JournalEntryID.IsNil() {
		return NewValidationError("journal_entry_id is required")
	}
	if gl.DebitAmount > 0 && gl.CreditAmount > 0 {
		return NewValidationError("entry cannot have both debit and credit amounts")
	}
	if gl.DebitAmount == 0 && gl.CreditAmount == 0 {
		return NewValidationError("entry must have either debit or credit amount")
	}
	if gl.ExchangeRate <= 0 {
		return NewValidationError("exchange_rate must be positive")
	}
	return nil
}

// ValidationError represents a validation error
type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}

// NewValidationError creates a new validation error
func NewValidationError(message string) *ValidationError {
	return &ValidationError{Message: message}
}