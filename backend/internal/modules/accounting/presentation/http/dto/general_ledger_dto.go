package dto

import (
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// GeneralLedgerCreateRequest represents the request to create a general ledger entry
type GeneralLedgerCreateRequest struct {
	AccountID        uuid.ID `json:"account_id" validate:"required"`
	JournalEntryID   uuid.ID `json:"journal_entry_id" validate:"required"`
	TransactionDate  time.Time `json:"transaction_date" validate:"required"`
	Description      string    `json:"description" validate:"required,max=500"`
	Reference        string    `json:"reference" validate:"max=100"`
	DebitAmount      float64   `json:"debit_amount" validate:"min=0"`
	CreditAmount     float64   `json:"credit_amount" validate:"min=0"`
	CurrencyCode     string    `json:"currency_code" validate:"required,len=3"`
	ExchangeRate     float64   `json:"exchange_rate" validate:"min=0"`
	CompanyID        string    `json:"company_id" validate:"required"`
}

// GeneralLedgerUpdateRequest represents the request to update a general ledger entry
type GeneralLedgerUpdateRequest struct {
	AccountID        uuid.ID `json:"account_id" validate:"required"`
	JournalEntryID   uuid.ID `json:"journal_entry_id" validate:"required"`
	TransactionDate  time.Time `json:"transaction_date" validate:"required"`
	Description      string    `json:"description" validate:"required,max=500"`
	Reference        string    `json:"reference" validate:"max=100"`
	DebitAmount      float64   `json:"debit_amount" validate:"min=0"`
	CreditAmount     float64   `json:"credit_amount" validate:"min=0"`
	CurrencyCode     string    `json:"currency_code" validate:"required,len=3"`
	ExchangeRate     float64   `json:"exchange_rate" validate:"min=0"`
}

// GeneralLedgerResponse represents the response for a general ledger entry
type GeneralLedgerResponse struct {
	ID               uuid.ID `json:"id"`
	AccountID        uuid.ID `json:"account_id"`
	JournalEntryID   uuid.ID `json:"journal_entry_id"`
	TransactionDate  time.Time `json:"transaction_date"`
	Description      string    `json:"description"`
	Reference        string    `json:"reference"`
	DebitAmount      float64   `json:"debit_amount"`
	CreditAmount     float64   `json:"credit_amount"`
	Balance          float64   `json:"balance"`
	CurrencyCode     string    `json:"currency_code"`
	ExchangeRate     float64   `json:"exchange_rate"`
	BaseDebitAmount  float64   `json:"base_debit_amount"`
	BaseCreditAmount float64   `json:"base_credit_amount"`
	CompanyID        string    `json:"company_id"`
	CreatedBy        string    `json:"created_by"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	IsDebit          bool      `json:"is_debit"`
	IsCredit         bool      `json:"is_credit"`
	Amount           float64   `json:"amount"`
}

// AccountBalanceRequest represents a request for account balance
type AccountBalanceRequest struct {
	AccountID uuid.ID `json:"account_id" validate:"required"`
	AsOfDate  time.Time `json:"as_of_date" validate:"required"`
}

// AccountBalanceResponse represents the response for account balance
type AccountBalanceResponse struct {
	AccountID uuid.ID `json:"account_id"`
	Balance   float64   `json:"balance"`
	AsOfDate  time.Time `json:"as_of_date"`
}

// LedgerReportRequest represents a request for ledger report
type LedgerReportRequest struct {
	AccountID uuid.ID `json:"account_id" validate:"required"`
	StartDate time.Time `json:"start_date" validate:"required"`
	EndDate   time.Time `json:"end_date" validate:"required"`
}

// LedgerReportResponse represents the response for ledger report
type LedgerReportResponse struct {
	AccountID       uuid.ID               `json:"account_id"`
	StartDate       time.Time               `json:"start_date"`
	EndDate         time.Time               `json:"end_date"`
	OpeningBalance  float64                 `json:"opening_balance"`
	ClosingBalance  float64                 `json:"closing_balance"`
	TotalDebits     float64                 `json:"total_debits"`
	TotalCredits    float64                 `json:"total_credits"`
	EntryCount      int                     `json:"entry_count"`
	Entries         []GeneralLedgerResponse `json:"entries"`
}

// ToGeneralLedgerEntity converts create request to entity
func (r *GeneralLedgerCreateRequest) ToGeneralLedgerEntity() *entities.GeneralLedger {
	return &entities.GeneralLedger{
		AccountID:       r.AccountID,
		JournalEntryID:  r.JournalEntryID,
		TransactionDate: r.TransactionDate,
		Description:     r.Description,
		Reference:       r.Reference,
		DebitAmount:     r.DebitAmount,
		CreditAmount:    r.CreditAmount,
		CurrencyCode:    r.CurrencyCode,
		ExchangeRate:    r.ExchangeRate,
		CompanyID:       r.CompanyID,
	}
}

// ToGeneralLedgerEntity converts update request to entity
func (r *GeneralLedgerUpdateRequest) ToGeneralLedgerEntity() *entities.GeneralLedger {
	return &entities.GeneralLedger{
		AccountID:       r.AccountID,
		JournalEntryID:  r.JournalEntryID,
		TransactionDate: r.TransactionDate,
		Description:     r.Description,
		Reference:       r.Reference,
		DebitAmount:     r.DebitAmount,
		CreditAmount:    r.CreditAmount,
		CurrencyCode:    r.CurrencyCode,
		ExchangeRate:    r.ExchangeRate,
	}
}

// FromGeneralLedgerEntity converts entity to response
func FromGeneralLedgerEntity(entry *entities.GeneralLedger) *GeneralLedgerResponse {
	return &GeneralLedgerResponse{
		ID:               entry.ID,
		AccountID:        entry.AccountID,
		JournalEntryID:   entry.JournalEntryID,
		TransactionDate:  entry.TransactionDate,
		Description:      entry.Description,
		Reference:        entry.Reference,
		DebitAmount:      entry.DebitAmount,
		CreditAmount:     entry.CreditAmount,
		Balance:          entry.Balance,
		CurrencyCode:     entry.CurrencyCode,
		ExchangeRate:     entry.ExchangeRate,
		BaseDebitAmount:  entry.BaseDebitAmount,
		BaseCreditAmount: entry.BaseCreditAmount,
		CompanyID:        entry.CompanyID,
		CreatedBy:        entry.CreatedBy,
		CreatedAt:        entry.CreatedAt,
		UpdatedAt:        entry.UpdatedAt,
		IsDebit:          entry.IsDebit(),
		IsCredit:         entry.IsCredit(),
		Amount:           entry.GetAmount(),
	}
}

// FromGeneralLedgerEntities converts multiple entities to responses
func FromGeneralLedgerEntities(entries []*entities.GeneralLedger) []GeneralLedgerResponse {
	responses := make([]GeneralLedgerResponse, len(entries))
	for i, entry := range entries {
		responses[i] = *FromGeneralLedgerEntity(entry)
	}
	return responses
}

// Validate validates the create request
func (r *GeneralLedgerCreateRequest) Validate() error {
	if r.AccountID == uuid.Nil {
		return &entities.ValidationError{Message: "account_id is required"}
	}
	if r.JournalEntryID == uuid.Nil {
		return &entities.ValidationError{Message: "journal_entry_id is required"}
	}
	if r.TransactionDate.IsZero() {
		return &entities.ValidationError{Message: "transaction_date is required"}
	}
	if r.Description == "" {
		return &entities.ValidationError{Message: "description is required"}
	}
	if r.DebitAmount > 0 && r.CreditAmount > 0 {
		return &entities.ValidationError{Message: "entry cannot have both debit and credit amounts"}
	}
	if r.DebitAmount == 0 && r.CreditAmount == 0 {
		return &entities.ValidationError{Message: "entry must have either debit or credit amount"}
	}
	if r.CurrencyCode == "" {
		return &entities.ValidationError{Message: "currency_code is required"}
	}
	if r.ExchangeRate <= 0 {
		return &entities.ValidationError{Message: "exchange_rate must be positive"}
	}
	if r.CompanyID == "" {
		return &entities.ValidationError{Message: "company_id is required"}
	}
	return nil
}

// Validate validates the update request
func (r *GeneralLedgerUpdateRequest) Validate() error {
	if r.AccountID == uuid.Nil {
		return &entities.ValidationError{Message: "account_id is required"}
	}
	if r.JournalEntryID == uuid.Nil {
		return &entities.ValidationError{Message: "journal_entry_id is required"}
	}
	if r.TransactionDate.IsZero() {
		return &entities.ValidationError{Message: "transaction_date is required"}
	}
	if r.Description == "" {
		return &entities.ValidationError{Message: "description is required"}
	}
	if r.DebitAmount > 0 && r.CreditAmount > 0 {
		return &entities.ValidationError{Message: "entry cannot have both debit and credit amounts"}
	}
	if r.DebitAmount == 0 && r.CreditAmount == 0 {
		return &entities.ValidationError{Message: "entry must have either debit or credit amount"}
	}
	if r.CurrencyCode == "" {
		return &entities.ValidationError{Message: "currency_code is required"}
	}
	if r.ExchangeRate <= 0 {
		return &entities.ValidationError{Message: "exchange_rate must be positive"}
	}
	return nil
}