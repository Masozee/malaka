package services

import (
	"context"
	"fmt"
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

// generalLedgerServiceImpl implements GeneralLedgerService with journal integration
type generalLedgerServiceImpl struct {
	glRepo      repositories.GeneralLedgerRepository
	journalRepo repositories.JournalEntryRepository
}

// NewGeneralLedgerServiceImpl creates a new general ledger service with journal integration
func NewGeneralLedgerServiceImpl(glRepo repositories.GeneralLedgerRepository, journalRepo repositories.JournalEntryRepository) GeneralLedgerService {
	return &generalLedgerServiceImpl{
		glRepo:      glRepo,
		journalRepo: journalRepo,
	}
}

// CreateEntry creates a new general ledger entry
func (s *generalLedgerServiceImpl) CreateEntry(ctx context.Context, entry *entities.GeneralLedger) error {
	if err := s.ValidateEntry(ctx, entry); err != nil {
		return err
	}

	// Set exchange rate to 1.0 if not provided for base currency
	if entry.ExchangeRate <= 0 {
		entry.ExchangeRate = 1.0
	}

	// Calculate base amounts
	entry.CalculateBaseAmounts()

	return s.glRepo.Create(ctx, entry)
}

// GetEntryByID retrieves a general ledger entry by ID
func (s *generalLedgerServiceImpl) GetEntryByID(ctx context.Context, id uuid.ID) (*entities.GeneralLedger, error) {
	return s.glRepo.GetByID(ctx, id)
}

// GetAllEntries retrieves all general ledger entries
func (s *generalLedgerServiceImpl) GetAllEntries(ctx context.Context) ([]*entities.GeneralLedger, error) {
	return s.glRepo.GetAll(ctx)
}

// UpdateEntry updates a general ledger entry
func (s *generalLedgerServiceImpl) UpdateEntry(ctx context.Context, entry *entities.GeneralLedger) error {
	if err := s.ValidateEntry(ctx, entry); err != nil {
		return err
	}

	// Calculate base amounts
	entry.CalculateBaseAmounts()

	return s.glRepo.Update(ctx, entry)
}

// DeleteEntry deletes a general ledger entry
func (s *generalLedgerServiceImpl) DeleteEntry(ctx context.Context, id uuid.ID) error {
	return s.glRepo.Delete(ctx, id)
}

// GetEntriesByAccount retrieves entries by account ID
func (s *generalLedgerServiceImpl) GetEntriesByAccount(ctx context.Context, accountID uuid.ID) ([]*entities.GeneralLedger, error) {
	return s.glRepo.GetByAccountID(ctx, accountID)
}

// GetAccountBalance calculates account balance as of a specific date
func (s *generalLedgerServiceImpl) GetAccountBalance(ctx context.Context, accountID uuid.ID, asOfDate time.Time) (float64, error) {
	return s.glRepo.GetAccountBalance(ctx, accountID, asOfDate)
}

// GetAccountMovements retrieves account movements for a period
func (s *generalLedgerServiceImpl) GetAccountMovements(ctx context.Context, accountID uuid.ID, startDate, endDate time.Time) ([]*entities.GeneralLedger, error) {
	return s.glRepo.GetAccountMovements(ctx, accountID, startDate, endDate)
}

// RecalculateAccountBalances recalculates running balances for an account
func (s *generalLedgerServiceImpl) RecalculateAccountBalances(ctx context.Context, accountID uuid.ID) error {
	return s.glRepo.RecalculateAccountBalances(ctx, accountID)
}

// GetEntriesByJournalEntry retrieves entries by journal entry ID
func (s *generalLedgerServiceImpl) GetEntriesByJournalEntry(ctx context.Context, journalEntryID uuid.ID) ([]*entities.GeneralLedger, error) {
	return s.glRepo.GetByJournalEntryID(ctx, journalEntryID)
}

// CreateEntriesFromJournal creates general ledger entries from a journal entry
func (s *generalLedgerServiceImpl) CreateEntriesFromJournal(ctx context.Context, journalEntry *entities.JournalEntry) error {
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

	return s.glRepo.CreateBatch(ctx, ledgerEntries)
}

// GetTrialBalanceData retrieves data for trial balance
func (s *generalLedgerServiceImpl) GetTrialBalanceData(ctx context.Context, companyID string, asOfDate time.Time) ([]*entities.GeneralLedger, error) {
	return s.glRepo.GetTrialBalanceData(ctx, companyID, asOfDate)
}

// GetLedgerReport generates a ledger report for an account
func (s *generalLedgerServiceImpl) GetLedgerReport(ctx context.Context, accountID uuid.ID, startDate, endDate time.Time) ([]*entities.GeneralLedger, error) {
	entries, err := s.glRepo.GetByAccountAndDateRange(ctx, accountID, startDate, endDate)
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
func (s *generalLedgerServiceImpl) GetEntriesByCompany(ctx context.Context, companyID string) ([]*entities.GeneralLedger, error) {
	return s.glRepo.GetByCompanyID(ctx, companyID)
}

// GetEntriesByCompanyAndDateRange retrieves entries by company and date range
func (s *generalLedgerServiceImpl) GetEntriesByCompanyAndDateRange(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.GeneralLedger, error) {
	return s.glRepo.GetByCompanyAndDateRange(ctx, companyID, startDate, endDate)
}

// ValidateEntry validates a general ledger entry
func (s *generalLedgerServiceImpl) ValidateEntry(ctx context.Context, entry *entities.GeneralLedger) error {
	return entry.Validate()
}

// PostJournalToLedger posts a journal entry to the general ledger
func (s *generalLedgerServiceImpl) PostJournalToLedger(ctx context.Context, journalEntryID uuid.ID) error {
	// Retrieve the journal entry
	journalEntry, err := s.journalRepo.GetByID(ctx, journalEntryID)
	if err != nil {
		return fmt.Errorf("failed to retrieve journal entry: %w", err)
	}

	// Check if journal entry is in correct status for posting
	if journalEntry.Status != entities.JournalEntryStatusPosted {
		return &entities.ValidationError{
			Message: fmt.Sprintf("journal entry must be in POSTED status to post to ledger, current status: %s", journalEntry.Status),
		}
	}

	// Check if entries already exist in general ledger for this journal
	existingEntries, err := s.glRepo.GetByJournalEntryID(ctx, journalEntryID)
	if err != nil {
		return fmt.Errorf("failed to check existing ledger entries: %w", err)
	}

	if len(existingEntries) > 0 {
		return &entities.ValidationError{
			Message: "journal entry has already been posted to general ledger",
		}
	}

	// Create general ledger entries from journal entry
	if err := s.CreateEntriesFromJournal(ctx, journalEntry); err != nil {
		return fmt.Errorf("failed to create ledger entries from journal: %w", err)
	}

	// Update account balances for all affected accounts
	for _, line := range journalEntry.Lines {
		if err := s.glRepo.RecalculateAccountBalances(ctx, line.AccountID); err != nil {
			return fmt.Errorf("failed to recalculate balance for account %s: %w", line.AccountID, err)
		}
	}

	return nil
}