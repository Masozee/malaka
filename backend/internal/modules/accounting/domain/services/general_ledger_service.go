package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

// GeneralLedgerService defines the interface for general ledger business logic
type GeneralLedgerService interface {
	// Basic CRUD operations
	CreateEntry(ctx context.Context, entry *entities.GeneralLedger) error
	GetEntryByID(ctx context.Context, id uuid.UUID) (*entities.GeneralLedger, error)
	GetAllEntries(ctx context.Context) ([]*entities.GeneralLedger, error)
	UpdateEntry(ctx context.Context, entry *entities.GeneralLedger) error
	DeleteEntry(ctx context.Context, id uuid.UUID) error

	// Account operations
	GetEntriesByAccount(ctx context.Context, accountID uuid.UUID) ([]*entities.GeneralLedger, error)
	GetAccountBalance(ctx context.Context, accountID uuid.UUID, asOfDate time.Time) (float64, error)
	GetAccountMovements(ctx context.Context, accountID uuid.UUID, startDate, endDate time.Time) ([]*entities.GeneralLedger, error)
	RecalculateAccountBalances(ctx context.Context, accountID uuid.UUID) error

	// Journal entry operations
	GetEntriesByJournalEntry(ctx context.Context, journalEntryID uuid.UUID) ([]*entities.GeneralLedger, error)
	CreateEntriesFromJournal(ctx context.Context, journalEntry *entities.JournalEntry) error

	// Reporting operations
	GetTrialBalanceData(ctx context.Context, companyID string, asOfDate time.Time) ([]*entities.GeneralLedger, error)
	GetLedgerReport(ctx context.Context, accountID uuid.UUID, startDate, endDate time.Time) ([]*entities.GeneralLedger, error)

	// Company operations
	GetEntriesByCompany(ctx context.Context, companyID string) ([]*entities.GeneralLedger, error)
	GetEntriesByCompanyAndDateRange(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.GeneralLedger, error)

	// Validation and business rules
	ValidateEntry(ctx context.Context, entry *entities.GeneralLedger) error
	PostJournalToLedger(ctx context.Context, journalEntryID uuid.UUID) error
}

type generalLedgerService struct {
	repo repositories.GeneralLedgerRepository
}

// NewGeneralLedgerService creates a new general ledger service
func NewGeneralLedgerService(repo repositories.GeneralLedgerRepository) GeneralLedgerService {
	return &generalLedgerService{repo: repo}
}

// CreateEntry creates a new general ledger entry
func (s *generalLedgerService) CreateEntry(ctx context.Context, entry *entities.GeneralLedger) error {
	if err := s.ValidateEntry(ctx, entry); err != nil {
		return err
	}

	// Set exchange rate to 1.0 if not provided for base currency
	if entry.ExchangeRate <= 0 {
		entry.ExchangeRate = 1.0
	}

	return s.repo.Create(ctx, entry)
}

// GetEntryByID retrieves a general ledger entry by ID
func (s *generalLedgerService) GetEntryByID(ctx context.Context, id uuid.UUID) (*entities.GeneralLedger, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllEntries retrieves all general ledger entries
func (s *generalLedgerService) GetAllEntries(ctx context.Context) ([]*entities.GeneralLedger, error) {
	return s.repo.GetAll(ctx)
}

// UpdateEntry updates a general ledger entry
func (s *generalLedgerService) UpdateEntry(ctx context.Context, entry *entities.GeneralLedger) error {
	if err := s.ValidateEntry(ctx, entry); err != nil {
		return err
	}

	return s.repo.Update(ctx, entry)
}

// DeleteEntry deletes a general ledger entry
func (s *generalLedgerService) DeleteEntry(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

// GetEntriesByAccount retrieves entries by account ID
func (s *generalLedgerService) GetEntriesByAccount(ctx context.Context, accountID uuid.UUID) ([]*entities.GeneralLedger, error) {
	return s.repo.GetByAccountID(ctx, accountID)
}

// GetAccountBalance calculates account balance as of a specific date
func (s *generalLedgerService) GetAccountBalance(ctx context.Context, accountID uuid.UUID, asOfDate time.Time) (float64, error) {
	return s.repo.GetAccountBalance(ctx, accountID, asOfDate)
}

// GetAccountMovements retrieves account movements for a period
func (s *generalLedgerService) GetAccountMovements(ctx context.Context, accountID uuid.UUID, startDate, endDate time.Time) ([]*entities.GeneralLedger, error) {
	return s.repo.GetAccountMovements(ctx, accountID, startDate, endDate)
}

// RecalculateAccountBalances recalculates running balances for an account
func (s *generalLedgerService) RecalculateAccountBalances(ctx context.Context, accountID uuid.UUID) error {
	return s.repo.RecalculateAccountBalances(ctx, accountID)
}

// GetEntriesByJournalEntry retrieves entries by journal entry ID
func (s *generalLedgerService) GetEntriesByJournalEntry(ctx context.Context, journalEntryID uuid.UUID) ([]*entities.GeneralLedger, error) {
	return s.repo.GetByJournalEntryID(ctx, journalEntryID)
}

// CreateEntriesFromJournal creates general ledger entries from a journal entry
func (s *generalLedgerService) CreateEntriesFromJournal(ctx context.Context, journalEntry *entities.JournalEntry) error {
	if journalEntry.Status != entities.JournalEntryStatusPosted {
		return &entities.ValidationError{Message: "journal entry must be posted to create ledger entries"}
	}

	var ledgerEntries []*entities.GeneralLedger

	for _, line := range journalEntry.Lines {
		entry := &entities.GeneralLedger{
			ID:               uuid.New(),
			AccountID:        line.AccountID,
			JournalEntryID:   journalEntry.ID,
			TransactionDate:  journalEntry.EntryDate,
			Description:      line.Description,
			Reference:        journalEntry.Reference,
			DebitAmount:      line.DebitAmount,
			CreditAmount:     line.CreditAmount,
			CurrencyCode:     journalEntry.CurrencyCode,
			ExchangeRate:     journalEntry.ExchangeRate,
			BaseDebitAmount:  line.BaseDebitAmount,
			BaseCreditAmount: line.BaseCreditAmount,
			CompanyID:        journalEntry.CompanyID,
			CreatedBy:        journalEntry.CreatedBy,
		}

		if err := entry.Validate(); err != nil {
			return err
		}

		ledgerEntries = append(ledgerEntries, entry)
	}

	return s.repo.CreateBatch(ctx, ledgerEntries)
}

// GetTrialBalanceData retrieves data for trial balance
func (s *generalLedgerService) GetTrialBalanceData(ctx context.Context, companyID string, asOfDate time.Time) ([]*entities.GeneralLedger, error) {
	return s.repo.GetTrialBalanceData(ctx, companyID, asOfDate)
}

// GetLedgerReport generates a ledger report for an account
func (s *generalLedgerService) GetLedgerReport(ctx context.Context, accountID uuid.UUID, startDate, endDate time.Time) ([]*entities.GeneralLedger, error) {
	entries, err := s.repo.GetByAccountAndDateRange(ctx, accountID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	// Calculate running balances
	runningBalance := 0.0
	for _, entry := range entries {
		runningBalance += entry.DebitAmount - entry.CreditAmount
		entry.Balance = runningBalance
	}

	return entries, nil
}

// GetEntriesByCompany retrieves entries by company ID
func (s *generalLedgerService) GetEntriesByCompany(ctx context.Context, companyID string) ([]*entities.GeneralLedger, error) {
	return s.repo.GetByCompanyID(ctx, companyID)
}

// GetEntriesByCompanyAndDateRange retrieves entries by company and date range
func (s *generalLedgerService) GetEntriesByCompanyAndDateRange(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.GeneralLedger, error) {
	return s.repo.GetByCompanyAndDateRange(ctx, companyID, startDate, endDate)
}

// ValidateEntry validates a general ledger entry
func (s *generalLedgerService) ValidateEntry(ctx context.Context, entry *entities.GeneralLedger) error {
	return entry.Validate()
}

// PostJournalToLedger posts a journal entry to the general ledger
func (s *generalLedgerService) PostJournalToLedger(ctx context.Context, journalEntryID uuid.UUID) error {
	// TODO: This would require access to journal entry repository
	// For now, return a placeholder implementation that can be completed
	// once journal entry repository is accessible from this service
	return &entities.ValidationError{Message: "posting to ledger requires journal entry repository integration"}
}