package repositories

import (
	"context"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/shared/uuid"
)

// GeneralLedgerRepository defines methods for general ledger operations
type GeneralLedgerRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, entry *entities.GeneralLedger) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.GeneralLedger, error)
	GetAll(ctx context.Context) ([]*entities.GeneralLedger, error)
	Update(ctx context.Context, entry *entities.GeneralLedger) error
	Delete(ctx context.Context, id uuid.ID) error

	// Query operations
	GetByAccountID(ctx context.Context, accountID uuid.ID) ([]*entities.GeneralLedger, error)
	GetByJournalEntryID(ctx context.Context, journalEntryID uuid.ID) ([]*entities.GeneralLedger, error)
	GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*entities.GeneralLedger, error)
	GetByAccountAndDateRange(ctx context.Context, accountID uuid.ID, startDate, endDate time.Time) ([]*entities.GeneralLedger, error)
	GetByReference(ctx context.Context, reference string) ([]*entities.GeneralLedger, error)
	
	// Balance calculations
	GetAccountBalance(ctx context.Context, accountID uuid.ID, asOfDate time.Time) (float64, error)
	GetAccountBalanceRange(ctx context.Context, accountID uuid.ID, startDate, endDate time.Time) (float64, error)
	
	// Reporting operations
	GetTrialBalanceData(ctx context.Context, companyID string, asOfDate time.Time) ([]*entities.GeneralLedger, error)
	GetAccountMovements(ctx context.Context, accountID uuid.ID, startDate, endDate time.Time) ([]*entities.GeneralLedger, error)
	
	// Company-specific operations
	GetByCompanyID(ctx context.Context, companyID string) ([]*entities.GeneralLedger, error)
	GetByCompanyAndDateRange(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.GeneralLedger, error)
	
	// Batch operations
	CreateBatch(ctx context.Context, entries []*entities.GeneralLedger) error
	UpdateBalance(ctx context.Context, accountID uuid.ID, balance float64) error
	RecalculateAccountBalances(ctx context.Context, accountID uuid.ID) error
}