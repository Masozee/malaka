package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// JournalEntryStatus represents the status of a journal entry
type JournalEntryStatus string

const (
	JournalEntryStatusDraft    JournalEntryStatus = "DRAFT"
	JournalEntryStatusPosted   JournalEntryStatus = "POSTED"
	JournalEntryStatusReversed JournalEntryStatus = "REVERSED"
)

// JournalEntry represents a journal entry header
type JournalEntry struct {
	ID              uuid.ID            `json:"id" db:"id"`
	EntryNumber     string             `json:"entry_number" db:"entry_number"`         // Auto-generated unique number
	EntryDate       time.Time          `json:"entry_date" db:"entry_date"`
	Description     string             `json:"description" db:"description"`
	Reference       string             `json:"reference" db:"reference"`               // External reference/document
	Status          JournalEntryStatus `json:"status" db:"status"`
	TotalDebit      float64            `json:"total_debit" db:"total_debit"`
	TotalCredit     float64            `json:"total_credit" db:"total_credit"`
	CurrencyCode    string             `json:"currency_code" db:"currency_code"`
	ExchangeRate    float64            `json:"exchange_rate" db:"exchange_rate"`
	BaseTotalDebit  float64            `json:"base_total_debit" db:"base_total_debit"`   // Amount in base currency
	BaseTotalCredit float64            `json:"base_total_credit" db:"base_total_credit"` // Amount in base currency
	SourceModule    string             `json:"source_module" db:"source_module"`         // e.g., SALES, PURCHASE, INVENTORY
	SourceID        string             `json:"source_id" db:"source_id"`                 // ID from source module
	PostedBy        string             `json:"posted_by" db:"posted_by"`
	PostedAt        *time.Time         `json:"posted_at" db:"posted_at"`
	ReversedBy      string             `json:"reversed_by" db:"reversed_by"`
	ReversedAt      *time.Time         `json:"reversed_at" db:"reversed_at"`
	CompanyID       string             `json:"company_id" db:"company_id"`
	CreatedBy       string             `json:"created_by" db:"created_by"`
	CreatedAt       time.Time          `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at" db:"updated_at"`
	
	// Associated journal entry lines (not stored in DB, loaded separately)
	Lines []*JournalEntryLine `json:"lines,omitempty" db:"-"`
}

// JournalEntryLine represents a journal entry line item
type JournalEntryLine struct {
	ID               uuid.ID `json:"id" db:"id"`
	JournalEntryID   uuid.ID `json:"journal_entry_id" db:"journal_entry_id"`
	LineNumber       int     `json:"line_number" db:"line_number"`
	AccountID        uuid.ID `json:"account_id" db:"account_id"`
	Description      string    `json:"description" db:"description"`
	DebitAmount      float64   `json:"debit_amount" db:"debit_amount"`
	CreditAmount     float64   `json:"credit_amount" db:"credit_amount"`
	BaseDebitAmount  float64   `json:"base_debit_amount" db:"base_debit_amount"`
	BaseCreditAmount float64   `json:"base_credit_amount" db:"base_credit_amount"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

// IsBalanced returns true if total debits equal total credits
func (je *JournalEntry) IsBalanced() bool {
	return je.TotalDebit == je.TotalCredit
}

// CalculateTotals calculates the total debit and credit amounts from lines
func (je *JournalEntry) CalculateTotals() {
	je.TotalDebit = 0
	je.TotalCredit = 0
	je.BaseTotalDebit = 0
	je.BaseTotalCredit = 0
	
	for _, line := range je.Lines {
		je.TotalDebit += line.DebitAmount
		je.TotalCredit += line.CreditAmount
		je.BaseTotalDebit += line.BaseDebitAmount
		je.BaseTotalCredit += line.BaseCreditAmount
	}
}

// CanBePosted returns true if the journal entry can be posted
func (je *JournalEntry) CanBePosted() bool {
	return je.Status == JournalEntryStatusDraft && je.IsBalanced() && len(je.Lines) > 0
}

// CanBeReversed returns true if the journal entry can be reversed
func (je *JournalEntry) CanBeReversed() bool {
	return je.Status == JournalEntryStatusPosted
}

// Post marks the journal entry as posted
func (je *JournalEntry) Post(userID string) error {
	if !je.CanBePosted() {
		return NewValidationError("journal entry cannot be posted")
	}
	
	now := time.Now()
	je.Status = JournalEntryStatusPosted
	je.PostedBy = userID
	je.PostedAt = &now
	je.UpdatedAt = now
	
	return nil
}

// Reverse marks the journal entry as reversed
func (je *JournalEntry) Reverse(userID string) error {
	if !je.CanBeReversed() {
		return NewValidationError("journal entry cannot be reversed")
	}
	
	now := time.Now()
	je.Status = JournalEntryStatusReversed
	je.ReversedBy = userID
	je.ReversedAt = &now
	je.UpdatedAt = now
	
	return nil
}

// Validate checks if the journal entry is valid
func (je *JournalEntry) Validate() error {
	if je.EntryDate.IsZero() {
		return NewValidationError("entry_date is required")
	}
	if je.Description == "" {
		return NewValidationError("description is required")
	}
	if je.ExchangeRate <= 0 {
		return NewValidationError("exchange_rate must be positive")
	}
	if len(je.Lines) == 0 {
		return NewValidationError("at least one journal entry line is required")
	}
	if !je.IsBalanced() {
		return NewValidationError("journal entry must be balanced (total debits = total credits)")
	}
	
	// Validate each line
	for i, line := range je.Lines {
		if err := line.Validate(); err != nil {
			return NewValidationError("line " + string(rune(i+1)) + ": " + err.Error())
		}
	}
	
	return nil
}

// Validate checks if the journal entry line is valid
func (jel *JournalEntryLine) Validate() error {
	if jel.JournalEntryID.IsNil() {
		return NewValidationError("journal_entry_id is required")
	}
	if jel.AccountID.IsNil() {
		return NewValidationError("account_id is required")
	}
	if jel.DebitAmount > 0 && jel.CreditAmount > 0 {
		return NewValidationError("line cannot have both debit and credit amounts")
	}
	if jel.DebitAmount == 0 && jel.CreditAmount == 0 {
		return NewValidationError("line must have either debit or credit amount")
	}
	if jel.LineNumber <= 0 {
		return NewValidationError("line_number must be positive")
	}
	
	return nil
}

// IsDebit returns true if this is a debit line
func (jel *JournalEntryLine) IsDebit() bool {
	return jel.DebitAmount > 0
}

// IsCredit returns true if this is a credit line
func (jel *JournalEntryLine) IsCredit() bool {
	return jel.CreditAmount > 0
}

// GetAmount returns the non-zero amount (debit or credit)
func (jel *JournalEntryLine) GetAmount() float64 {
	if jel.IsDebit() {
		return jel.DebitAmount
	}
	return jel.CreditAmount
}

// CalculateBaseAmounts calculates base currency amounts using exchange rate
func (jel *JournalEntryLine) CalculateBaseAmounts(exchangeRate float64) {
	jel.BaseDebitAmount = jel.DebitAmount / exchangeRate
	jel.BaseCreditAmount = jel.CreditAmount / exchangeRate
}