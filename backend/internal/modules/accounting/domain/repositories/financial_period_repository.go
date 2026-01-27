package repositories

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// FinancialPeriodRepository defines the interface for financial period persistence
type FinancialPeriodRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, period *entities.FinancialPeriod) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.FinancialPeriod, error)
	GetAll(ctx context.Context) ([]*entities.FinancialPeriod, error)
	Update(ctx context.Context, period *entities.FinancialPeriod) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Query operations
	GetByCompany(ctx context.Context, companyID string) ([]*entities.FinancialPeriod, error)
	GetByFiscalYear(ctx context.Context, companyID string, fiscalYear int) ([]*entities.FinancialPeriod, error)
	GetCurrent(ctx context.Context, companyID string) (*entities.FinancialPeriod, error)
	GetOpenPeriods(ctx context.Context, companyID string) ([]*entities.FinancialPeriod, error)
	GetClosedPeriods(ctx context.Context, companyID string) ([]*entities.FinancialPeriod, error)

	// Period management
	Close(ctx context.Context, id uuid.UUID, userID string) error
	Reopen(ctx context.Context, id uuid.UUID) error
}
