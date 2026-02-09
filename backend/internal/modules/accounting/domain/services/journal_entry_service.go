package services

import (
	"context"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
	"malaka/internal/shared/uuid"
)

// JournalEntryService defines the interface for journal entry business logic
type JournalEntryService interface {
	// Basic CRUD operations
	CreateJournalEntry(ctx context.Context, entry *entities.JournalEntry) error
	GetJournalEntryByID(ctx context.Context, id uuid.ID) (*entities.JournalEntry, error)
	GetAllJournalEntries(ctx context.Context) ([]*entities.JournalEntry, error)
	UpdateJournalEntry(ctx context.Context, entry *entities.JournalEntry) error
	DeleteJournalEntry(ctx context.Context, id uuid.ID) error

	// Line operations
	AddLine(ctx context.Context, entryID uuid.ID, line *entities.JournalEntryLine) error
	UpdateLine(ctx context.Context, line *entities.JournalEntryLine) error
	DeleteLine(ctx context.Context, lineID uuid.ID) error

	// Status operations
	PostJournalEntry(ctx context.Context, entryID uuid.ID, userID string) error
	ReverseJournalEntry(ctx context.Context, entryID uuid.ID, userID string) error
	
	// Query operations
	GetJournalEntriesByStatus(ctx context.Context, status entities.JournalEntryStatus) ([]*entities.JournalEntry, error)
	GetJournalEntriesByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*entities.JournalEntry, error)
	GetJournalEntriesByCompany(ctx context.Context, companyID string) ([]*entities.JournalEntry, error)
	GetUnpostedEntries(ctx context.Context, companyID string) ([]*entities.JournalEntry, error)

	// Reporting operations
	GetJournalRegister(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.JournalEntry, error)
	GetEntriesForAccount(ctx context.Context, accountID uuid.ID, startDate, endDate time.Time) ([]*entities.JournalEntry, error)

	// Validation and business rules
	ValidateJournalEntry(ctx context.Context, entry *entities.JournalEntry) error
	CalculateTotals(ctx context.Context, entry *entities.JournalEntry) error
	CheckBalance(ctx context.Context, entry *entities.JournalEntry) (bool, error)

	// Integration operations
	CreateFromTransaction(ctx context.Context, sourceModule, sourceID string, transactionData map[string]interface{}) (*entities.JournalEntry, error)
	GetNextEntryNumber(ctx context.Context, companyID string, entryDate time.Time) (string, error)
}

type journalEntryService struct {
	repo repositories.JournalEntryRepository
}

// NewJournalEntryService creates a new journal entry service
func NewJournalEntryService(repo repositories.JournalEntryRepository) JournalEntryService {
	return &journalEntryService{repo: repo}
}

// CreateJournalEntry creates a new journal entry
func (s *journalEntryService) CreateJournalEntry(ctx context.Context, entry *entities.JournalEntry) error {
	if err := s.ValidateJournalEntry(ctx, entry); err != nil {
		return err
	}

	// Generate entry number if not provided
	if entry.EntryNumber == "" {
		entryNumber, err := s.GetNextEntryNumber(ctx, entry.CompanyID, entry.EntryDate)
		if err != nil {
			return err
		}
		entry.EntryNumber = entryNumber
	}

	// Set default status
	if entry.Status == "" {
		entry.Status = entities.JournalEntryStatusDraft
	}

	// Set default exchange rate
	if entry.ExchangeRate <= 0 {
		entry.ExchangeRate = 1.0
	}

	// Calculate base amounts for lines
	for i := range entry.Lines {
		entry.Lines[i].CalculateBaseAmounts(entry.ExchangeRate)
	}

	// Calculate totals
	entry.CalculateTotals()

	return s.repo.CreateWithLines(ctx, entry)
}

// GetJournalEntryByID retrieves a journal entry by ID
func (s *journalEntryService) GetJournalEntryByID(ctx context.Context, id uuid.ID) (*entities.JournalEntry, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllJournalEntries retrieves all journal entries
func (s *journalEntryService) GetAllJournalEntries(ctx context.Context) ([]*entities.JournalEntry, error) {
	return s.repo.GetAll(ctx)
}

// UpdateJournalEntry updates a journal entry
func (s *journalEntryService) UpdateJournalEntry(ctx context.Context, entry *entities.JournalEntry) error {
	// Check if entry can be modified
	if entry.Status == entities.JournalEntryStatusPosted {
		return &entities.ValidationError{Message: "cannot modify posted journal entry"}
	}

	if err := s.ValidateJournalEntry(ctx, entry); err != nil {
		return err
	}

	// Calculate base amounts for lines
	for i := range entry.Lines {
		entry.Lines[i].CalculateBaseAmounts(entry.ExchangeRate)
	}

	// Calculate totals
	entry.CalculateTotals()

	return s.repo.UpdateWithLines(ctx, entry)
}

// DeleteJournalEntry deletes a journal entry
func (s *journalEntryService) DeleteJournalEntry(ctx context.Context, id uuid.ID) error {
	// Check if entry can be deleted
	entry, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if entry.Status == entities.JournalEntryStatusPosted {
		return &entities.ValidationError{Message: "cannot delete posted journal entry"}
	}

	return s.repo.Delete(ctx, id)
}

// AddLine adds a line to a journal entry
func (s *journalEntryService) AddLine(ctx context.Context, entryID uuid.ID, line *entities.JournalEntryLine) error {
	// Validate the entry exists and is modifiable
	entry, err := s.repo.GetByID(ctx, entryID)
	if err != nil {
		return err
	}

	if entry.Status == entities.JournalEntryStatusPosted {
		return &entities.ValidationError{Message: "cannot modify posted journal entry"}
	}

	line.JournalEntryID = entryID
	line.CalculateBaseAmounts(entry.ExchangeRate)

	if err := line.Validate(); err != nil {
		return err
	}

	return s.repo.CreateLine(ctx, line)
}

// UpdateLine updates a journal entry line
func (s *journalEntryService) UpdateLine(ctx context.Context, line *entities.JournalEntryLine) error {
	if err := line.Validate(); err != nil {
		return err
	}

	return s.repo.UpdateLine(ctx, line)
}

// DeleteLine deletes a journal entry line
func (s *journalEntryService) DeleteLine(ctx context.Context, lineID uuid.ID) error {
	return s.repo.DeleteLine(ctx, lineID)
}

// PostJournalEntry posts a journal entry
func (s *journalEntryService) PostJournalEntry(ctx context.Context, entryID uuid.ID, userID string) error {
	entry, err := s.repo.GetByID(ctx, entryID)
	if err != nil {
		return err
	}

	if !entry.CanBePosted() {
		return &entities.ValidationError{Message: "journal entry cannot be posted"}
	}

	return s.repo.Post(ctx, entryID, userID)
}

// ReverseJournalEntry reverses a journal entry
func (s *journalEntryService) ReverseJournalEntry(ctx context.Context, entryID uuid.ID, userID string) error {
	entry, err := s.repo.GetByID(ctx, entryID)
	if err != nil {
		return err
	}

	if !entry.CanBeReversed() {
		return &entities.ValidationError{Message: "journal entry cannot be reversed"}
	}

	return s.repo.Reverse(ctx, entryID, userID)
}

// GetJournalEntriesByStatus retrieves journal entries by status
func (s *journalEntryService) GetJournalEntriesByStatus(ctx context.Context, status entities.JournalEntryStatus) ([]*entities.JournalEntry, error) {
	return s.repo.GetByStatus(ctx, status)
}

// GetJournalEntriesByDateRange retrieves journal entries by date range
func (s *journalEntryService) GetJournalEntriesByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*entities.JournalEntry, error) {
	return s.repo.GetByDateRange(ctx, startDate, endDate)
}

// GetJournalEntriesByCompany retrieves journal entries by company
func (s *journalEntryService) GetJournalEntriesByCompany(ctx context.Context, companyID string) ([]*entities.JournalEntry, error) {
	return s.repo.GetByCompanyID(ctx, companyID)
}

// GetUnpostedEntries retrieves unposted entries for a company
func (s *journalEntryService) GetUnpostedEntries(ctx context.Context, companyID string) ([]*entities.JournalEntry, error) {
	return s.repo.GetUnpostedEntries(ctx, companyID)
}

// GetJournalRegister generates a journal register report
func (s *journalEntryService) GetJournalRegister(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.JournalEntry, error) {
	return s.repo.GetEntriesForPeriod(ctx, companyID, startDate, endDate)
}

// GetEntriesForAccount retrieves entries affecting a specific account
func (s *journalEntryService) GetEntriesForAccount(ctx context.Context, accountID uuid.ID, startDate, endDate time.Time) ([]*entities.JournalEntry, error) {
	return s.repo.GetEntriesByAccount(ctx, accountID, startDate, endDate)
}

// ValidateJournalEntry validates a journal entry
func (s *journalEntryService) ValidateJournalEntry(ctx context.Context, entry *entities.JournalEntry) error {
	return entry.Validate()
}

// CalculateTotals calculates the totals for a journal entry
func (s *journalEntryService) CalculateTotals(ctx context.Context, entry *entities.JournalEntry) error {
	entry.CalculateTotals()
	return nil
}

// CheckBalance checks if a journal entry is balanced
func (s *journalEntryService) CheckBalance(ctx context.Context, entry *entities.JournalEntry) (bool, error) {
	return entry.IsBalanced(), nil
}

// CreateFromTransaction creates a journal entry from a transaction
func (s *journalEntryService) CreateFromTransaction(ctx context.Context, sourceModule, sourceID string, transactionData map[string]interface{}) (*entities.JournalEntry, error) {
	// This is a template method that would be implemented based on specific business rules
	// for different source modules (SALES, PURCHASE, INVENTORY, etc.)
	
	entry := &entities.JournalEntry{
		EntryDate:    time.Now(),
		Description:  "Auto-generated from " + sourceModule,
		Status:       entities.JournalEntryStatusDraft,
		SourceModule: sourceModule,
		SourceID:     sourceID,
		ExchangeRate: 1.0,
		CurrencyCode: "IDR", // Default currency
	}

	// Extract data from transactionData based on sourceModule
	// This would be implemented with specific business logic for each module

	switch sourceModule {
	case "SALES":
		return s.createFromSalesTransaction(ctx, entry, transactionData)
	case "PURCHASE":
		return s.createFromPurchaseTransaction(ctx, entry, transactionData)
	case "INVENTORY":
		return s.createFromInventoryTransaction(ctx, entry, transactionData)
	default:
		return nil, &entities.ValidationError{Message: "unsupported source module: " + sourceModule}
	}
}

// GetNextEntryNumber generates the next entry number
func (s *journalEntryService) GetNextEntryNumber(ctx context.Context, companyID string, entryDate time.Time) (string, error) {
	return s.repo.GetNextEntryNumber(ctx, companyID, entryDate)
}

// Helper methods for creating journal entries from different transaction types

func (s *journalEntryService) createFromSalesTransaction(ctx context.Context, entry *entities.JournalEntry, data map[string]interface{}) (*entities.JournalEntry, error) {
	// Implement sales-specific journal entry creation logic
	// Example: Debit Accounts Receivable, Credit Sales Revenue
	return nil, &entities.ValidationError{Message: "sales transaction journal creation not implemented"}
}

func (s *journalEntryService) createFromPurchaseTransaction(ctx context.Context, entry *entities.JournalEntry, data map[string]interface{}) (*entities.JournalEntry, error) {
	// Implement purchase-specific journal entry creation logic
	// Example: Debit Inventory/Expense, Credit Accounts Payable
	return nil, &entities.ValidationError{Message: "purchase transaction journal creation not implemented"}
}

func (s *journalEntryService) createFromInventoryTransaction(ctx context.Context, entry *entities.JournalEntry, data map[string]interface{}) (*entities.JournalEntry, error) {
	// Implement inventory-specific journal entry creation logic
	// Example: Debit/Credit Inventory accounts based on movement type
	return nil, &entities.ValidationError{Message: "inventory transaction journal creation not implemented"}
}