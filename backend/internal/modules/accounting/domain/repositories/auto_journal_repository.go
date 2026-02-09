package repositories

import (
	"context"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/shared/uuid"
)

// AutoJournalConfigRepository defines the interface for auto journal configuration persistence
type AutoJournalConfigRepository interface {
	// Configuration CRUD operations
	Create(ctx context.Context, config *entities.AutoJournalConfig) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.AutoJournalConfig, error)
	GetBySourceAndType(ctx context.Context, sourceModule, transactionType string) (*entities.AutoJournalConfig, error)
	GetAll(ctx context.Context) ([]*entities.AutoJournalConfig, error)
	GetBySourceModule(ctx context.Context, sourceModule string) ([]*entities.AutoJournalConfig, error)
	GetActiveConfigs(ctx context.Context) ([]*entities.AutoJournalConfig, error)
	Update(ctx context.Context, config *entities.AutoJournalConfig) error
	Delete(ctx context.Context, id uuid.ID) error
	Upsert(ctx context.Context, config *entities.AutoJournalConfig) error

	// Log operations
	CreateLog(ctx context.Context, log *entities.AutoJournalLog) error
	GetLogByID(ctx context.Context, id uuid.ID) (*entities.AutoJournalLog, error)
	GetLogsByJournalEntry(ctx context.Context, journalEntryID uuid.ID) ([]*entities.AutoJournalLog, error)
	GetLogsBySource(ctx context.Context, sourceModule, sourceID string) ([]*entities.AutoJournalLog, error)
	GetLogsByStatus(ctx context.Context, status string) ([]*entities.AutoJournalLog, error)
	GetPendingLogs(ctx context.Context, sourceModule string) ([]*entities.AutoJournalLog, error)
	UpdateLogStatus(ctx context.Context, logID uuid.ID, status, errorMessage string) error
}