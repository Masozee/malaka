package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// JournalEntryRepository defines methods for journal entry operations
type JournalEntryRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, entry *entities.JournalEntry) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.JournalEntry, error)
	GetAll(ctx context.Context) ([]*entities.JournalEntry, error)
	Update(ctx context.Context, entry *entities.JournalEntry) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Journal entry lines operations
	CreateLine(ctx context.Context, line *entities.JournalEntryLine) error
	GetLinesByEntryID(ctx context.Context, entryID uuid.UUID) ([]*entities.JournalEntryLine, error)
	UpdateLine(ctx context.Context, line *entities.JournalEntryLine) error
	DeleteLine(ctx context.Context, lineID uuid.UUID) error
	DeleteLinesByEntryID(ctx context.Context, entryID uuid.UUID) error

	// Query operations
	GetByEntryNumber(ctx context.Context, entryNumber string) (*entities.JournalEntry, error)
	GetByStatus(ctx context.Context, status entities.JournalEntryStatus) ([]*entities.JournalEntry, error)
	GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*entities.JournalEntry, error)
	GetByReference(ctx context.Context, reference string) ([]*entities.JournalEntry, error)
	GetBySourceModule(ctx context.Context, sourceModule string) ([]*entities.JournalEntry, error)
	GetBySourceID(ctx context.Context, sourceModule, sourceID string) (*entities.JournalEntry, error)
	
	// Company-specific operations
	GetByCompanyID(ctx context.Context, companyID string) ([]*entities.JournalEntry, error)
	GetByCompanyAndStatus(ctx context.Context, companyID string, status entities.JournalEntryStatus) ([]*entities.JournalEntry, error)
	GetByCompanyAndDateRange(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.JournalEntry, error)
	
	// Posting operations
	Post(ctx context.Context, entryID uuid.UUID, userID string) error
	Reverse(ctx context.Context, entryID uuid.UUID, userID string) error
	
	// Number generation
	GetNextEntryNumber(ctx context.Context, companyID string, entryDate time.Time) (string, error)
	
	// Batch operations
	CreateWithLines(ctx context.Context, entry *entities.JournalEntry) error
	UpdateWithLines(ctx context.Context, entry *entities.JournalEntry) error
	
	// Reporting operations
	GetUnpostedEntries(ctx context.Context, companyID string) ([]*entities.JournalEntry, error)
	GetEntriesForPeriod(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.JournalEntry, error)
	GetEntriesByAccount(ctx context.Context, accountID uuid.UUID, startDate, endDate time.Time) ([]*entities.JournalEntry, error)
}