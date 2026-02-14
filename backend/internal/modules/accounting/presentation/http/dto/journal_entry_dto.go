package dto

import (
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// JournalEntryLineRequest represents a journal entry line in requests
type JournalEntryLineRequest struct {
	LineNumber   int       `json:"line_number" validate:"min=1"`
	AccountID    uuid.ID `json:"account_id" validate:"required"`
	Description  string    `json:"description" validate:"required,max=500"`
	DebitAmount  float64   `json:"debit_amount" validate:"min=0"`
	CreditAmount float64   `json:"credit_amount" validate:"min=0"`
}

// JournalEntryCreateRequest represents the request to create a journal entry
type JournalEntryCreateRequest struct {
	EntryDate    time.Time                 `json:"entry_date" validate:"required"`
	Description  string                    `json:"description" validate:"required,max=500"`
	Reference    string                    `json:"reference" validate:"max=100"`
	CurrencyCode string                    `json:"currency_code" validate:"required,len=3"`
	ExchangeRate float64                   `json:"exchange_rate" validate:"min=0"`
	SourceModule string                    `json:"source_module" validate:"max=50"`
	SourceID     string                    `json:"source_id" validate:"max=50"`
	CompanyID    string                    `json:"company_id" validate:"required"`
	Lines        []JournalEntryLineRequest `json:"lines" validate:"required,min=2"`
}

// JournalEntryUpdateRequest represents the request to update a journal entry
type JournalEntryUpdateRequest struct {
	EntryDate    time.Time                 `json:"entry_date" validate:"required"`
	Description  string                    `json:"description" validate:"required,max=500"`
	Reference    string                    `json:"reference" validate:"max=100"`
	CurrencyCode string                    `json:"currency_code" validate:"required,len=3"`
	ExchangeRate float64                   `json:"exchange_rate" validate:"min=0"`
	SourceModule string                    `json:"source_module" validate:"max=50"`
	SourceID     string                    `json:"source_id" validate:"max=50"`
	Lines        []JournalEntryLineRequest `json:"lines" validate:"required,min=2"`
}

// JournalEntryLineResponse represents a journal entry line in responses
type JournalEntryLineResponse struct {
	ID               uuid.ID   `json:"id"`
	LineNumber       int       `json:"line_number"`
	AccountID        uuid.ID   `json:"account_id"`
	AccountCode      string    `json:"account_code"`
	AccountName      string    `json:"account_name"`
	Description      string    `json:"description"`
	DebitAmount      float64   `json:"debit_amount"`
	CreditAmount     float64   `json:"credit_amount"`
	BaseDebitAmount  float64   `json:"base_debit_amount"`
	BaseCreditAmount float64   `json:"base_credit_amount"`
	IsDebit          bool      `json:"is_debit"`
	IsCredit         bool      `json:"is_credit"`
	Amount           float64   `json:"amount"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// JournalEntryResponse represents the response for a journal entry
type JournalEntryResponse struct {
	ID              uuid.ID                  `json:"id"`
	EntryNumber     string                     `json:"entry_number"`
	EntryDate       time.Time                  `json:"entry_date"`
	Description     string                     `json:"description"`
	Reference       string                     `json:"reference"`
	Status          string                     `json:"status"`
	TotalDebit      float64                    `json:"total_debit"`
	TotalCredit     float64                    `json:"total_credit"`
	CurrencyCode    string                     `json:"currency_code"`
	ExchangeRate    float64                    `json:"exchange_rate"`
	BaseTotalDebit  float64                    `json:"base_total_debit"`
	BaseTotalCredit float64                    `json:"base_total_credit"`
	SourceModule    string                     `json:"source_module"`
	SourceID        string                     `json:"source_id"`
	PostedBy        string                     `json:"posted_by"`
	PostedAt        *time.Time                 `json:"posted_at"`
	ReversedBy      string                     `json:"reversed_by"`
	ReversedAt      *time.Time                 `json:"reversed_at"`
	CompanyID       string                     `json:"company_id"`
	CreatedBy       string                     `json:"created_by"`
	CreatedByName   string                     `json:"created_by_name"`
	PostedByName    string                     `json:"posted_by_name"`
	CreatedAt       time.Time                  `json:"created_at"`
	UpdatedAt       time.Time                  `json:"updated_at"`
	IsBalanced      bool                       `json:"is_balanced"`
	CanBePosted     bool                       `json:"can_be_posted"`
	CanBeReversed   bool                       `json:"can_be_reversed"`
	Lines           []JournalEntryLineResponse `json:"lines"`
}

// PostJournalEntryRequest represents the request to post a journal entry
type PostJournalEntryRequest struct {
	UserID string `json:"user_id" validate:"required"`
}

// ReverseJournalEntryRequest represents the request to reverse a journal entry
type ReverseJournalEntryRequest struct {
	UserID string `json:"user_id" validate:"required"`
	Reason string `json:"reason" validate:"required,max=500"`
}

// JournalRegisterRequest represents a request for journal register report
type JournalRegisterRequest struct {
	CompanyID string    `json:"company_id" validate:"required"`
	StartDate time.Time `json:"start_date" validate:"required"`
	EndDate   time.Time `json:"end_date" validate:"required"`
	Status    string    `json:"status"`
}

// JournalRegisterResponse represents the response for journal register report
type JournalRegisterResponse struct {
	CompanyID       string                 `json:"company_id"`
	StartDate       time.Time              `json:"start_date"`
	EndDate         time.Time              `json:"end_date"`
	TotalEntries    int                    `json:"total_entries"`
	TotalDebits     float64                `json:"total_debits"`
	TotalCredits    float64                `json:"total_credits"`
	PostedEntries   int                    `json:"posted_entries"`
	UnpostedEntries int                    `json:"unposted_entries"`
	Entries         []JournalEntryResponse `json:"entries"`
}

// ToJournalEntryEntity converts create request to entity
func (r *JournalEntryCreateRequest) ToJournalEntryEntity() *entities.JournalEntry {
	lines := make([]*entities.JournalEntryLine, len(r.Lines))
	for i, lineReq := range r.Lines {
		lines[i] = &entities.JournalEntryLine{
			LineNumber:   lineReq.LineNumber,
			AccountID:    lineReq.AccountID,
			Description:  lineReq.Description,
			DebitAmount:  lineReq.DebitAmount,
			CreditAmount: lineReq.CreditAmount,
		}
	}

	return &entities.JournalEntry{
		EntryDate:    r.EntryDate,
		Description:  r.Description,
		Reference:    r.Reference,
		CurrencyCode: r.CurrencyCode,
		ExchangeRate: r.ExchangeRate,
		SourceModule: r.SourceModule,
		SourceID:     r.SourceID,
		CompanyID:    r.CompanyID,
		Lines:        lines,
	}
}

// ToJournalEntryEntity converts update request to entity
func (r *JournalEntryUpdateRequest) ToJournalEntryEntity() *entities.JournalEntry {
	lines := make([]*entities.JournalEntryLine, len(r.Lines))
	for i, lineReq := range r.Lines {
		lines[i] = &entities.JournalEntryLine{
			LineNumber:   lineReq.LineNumber,
			AccountID:    lineReq.AccountID,
			Description:  lineReq.Description,
			DebitAmount:  lineReq.DebitAmount,
			CreditAmount: lineReq.CreditAmount,
		}
	}

	return &entities.JournalEntry{
		EntryDate:    r.EntryDate,
		Description:  r.Description,
		Reference:    r.Reference,
		CurrencyCode: r.CurrencyCode,
		ExchangeRate: r.ExchangeRate,
		SourceModule: r.SourceModule,
		SourceID:     r.SourceID,
		Lines:        lines,
	}
}

// FromJournalEntryEntity converts entity to response
func FromJournalEntryEntity(entry *entities.JournalEntry) *JournalEntryResponse {
	lines := make([]JournalEntryLineResponse, len(entry.Lines))
	for i, line := range entry.Lines {
		lines[i] = JournalEntryLineResponse{
			ID:               line.ID,
			LineNumber:       line.LineNumber,
			AccountID:        line.AccountID,
			AccountCode:      line.AccountCode,
			AccountName:      line.AccountName,
			Description:      line.Description,
			DebitAmount:      line.DebitAmount,
			CreditAmount:     line.CreditAmount,
			BaseDebitAmount:  line.BaseDebitAmount,
			BaseCreditAmount: line.BaseCreditAmount,
			IsDebit:          line.IsDebit(),
			IsCredit:         line.IsCredit(),
			Amount:           line.GetAmount(),
			CreatedAt:        line.CreatedAt,
			UpdatedAt:        line.UpdatedAt,
		}
	}

	return &JournalEntryResponse{
		ID:              entry.ID,
		EntryNumber:     entry.EntryNumber,
		EntryDate:       entry.EntryDate,
		Description:     entry.Description,
		Reference:       entry.Reference,
		Status:          string(entry.Status),
		TotalDebit:      entry.TotalDebit,
		TotalCredit:     entry.TotalCredit,
		CurrencyCode:    entry.CurrencyCode,
		ExchangeRate:    entry.ExchangeRate,
		BaseTotalDebit:  entry.BaseTotalDebit,
		BaseTotalCredit: entry.BaseTotalCredit,
		SourceModule:    entry.SourceModule,
		SourceID:        entry.SourceID,
		PostedBy:        entry.PostedBy,
		PostedAt:        entry.PostedAt,
		ReversedBy:      entry.ReversedBy,
		ReversedAt:      entry.ReversedAt,
		CompanyID:       entry.CompanyID,
		CreatedBy:       entry.CreatedBy,
		CreatedByName:   entry.CreatedByName,
		PostedByName:    entry.PostedByName,
		CreatedAt:       entry.CreatedAt,
		UpdatedAt:       entry.UpdatedAt,
		IsBalanced:      entry.IsBalanced(),
		CanBePosted:     entry.CanBePosted(),
		CanBeReversed:   entry.CanBeReversed(),
		Lines:           lines,
	}
}

// FromJournalEntryEntities converts multiple entities to responses
func FromJournalEntryEntities(entries []*entities.JournalEntry) []JournalEntryResponse {
	responses := make([]JournalEntryResponse, len(entries))
	for i, entry := range entries {
		responses[i] = *FromJournalEntryEntity(entry)
	}
	return responses
}

// Validate validates the create request
func (r *JournalEntryCreateRequest) Validate() error {
	if r.EntryDate.IsZero() {
		return &entities.ValidationError{Message: "entry_date is required"}
	}
	if r.Description == "" {
		return &entities.ValidationError{Message: "description is required"}
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
	if len(r.Lines) < 2 {
		return &entities.ValidationError{Message: "at least two journal entry lines are required"}
	}

	// Validate lines
	totalDebits := 0.0
	totalCredits := 0.0
	for i, line := range r.Lines {
		if err := line.Validate(); err != nil {
			return &entities.ValidationError{Message: "line " + string(rune(i+1)) + ": " + err.Error()}
		}
		totalDebits += line.DebitAmount
		totalCredits += line.CreditAmount
	}

	// Check if balanced
	if totalDebits != totalCredits {
		return &entities.ValidationError{Message: "journal entry must be balanced (total debits must equal total credits)"}
	}

	return nil
}

// Validate validates the update request
func (r *JournalEntryUpdateRequest) Validate() error {
	if r.EntryDate.IsZero() {
		return &entities.ValidationError{Message: "entry_date is required"}
	}
	if r.Description == "" {
		return &entities.ValidationError{Message: "description is required"}
	}
	if r.CurrencyCode == "" {
		return &entities.ValidationError{Message: "currency_code is required"}
	}
	if r.ExchangeRate <= 0 {
		return &entities.ValidationError{Message: "exchange_rate must be positive"}
	}
	if len(r.Lines) < 2 {
		return &entities.ValidationError{Message: "at least two journal entry lines are required"}
	}

	// Validate lines
	totalDebits := 0.0
	totalCredits := 0.0
	for i, line := range r.Lines {
		if err := line.Validate(); err != nil {
			return &entities.ValidationError{Message: "line " + string(rune(i+1)) + ": " + err.Error()}
		}
		totalDebits += line.DebitAmount
		totalCredits += line.CreditAmount
	}

	// Check if balanced
	if totalDebits != totalCredits {
		return &entities.ValidationError{Message: "journal entry must be balanced (total debits must equal total credits)"}
	}

	return nil
}

// Validate validates the journal entry line request
func (r *JournalEntryLineRequest) Validate() error {
	if r.AccountID == uuid.Nil {
		return &entities.ValidationError{Message: "account_id is required"}
	}
	if r.Description == "" {
		return &entities.ValidationError{Message: "description is required"}
	}
	if r.DebitAmount > 0 && r.CreditAmount > 0 {
		return &entities.ValidationError{Message: "line cannot have both debit and credit amounts"}
	}
	if r.DebitAmount == 0 && r.CreditAmount == 0 {
		return &entities.ValidationError{Message: "line must have either debit or credit amount"}
	}
	if r.LineNumber <= 0 {
		return &entities.ValidationError{Message: "line_number must be positive"}
	}
	return nil
}