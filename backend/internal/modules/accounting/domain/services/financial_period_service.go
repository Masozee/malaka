package services

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// FinancialPeriodService defines the interface for financial period business logic
type FinancialPeriodService interface {
	// Basic CRUD operations
	CreateFinancialPeriod(ctx context.Context, period *entities.FinancialPeriod) error
	GetFinancialPeriodByID(ctx context.Context, id uuid.UUID) (*entities.FinancialPeriod, error)
	GetAllFinancialPeriods(ctx context.Context) ([]*entities.FinancialPeriod, error)
	UpdateFinancialPeriod(ctx context.Context, period *entities.FinancialPeriod) error
	DeleteFinancialPeriod(ctx context.Context, id uuid.UUID) error

	// Query operations
	GetFinancialPeriodsByCompany(ctx context.Context, companyID string) ([]*entities.FinancialPeriod, error)
	GetFinancialPeriodsByFiscalYear(ctx context.Context, companyID string, fiscalYear int) ([]*entities.FinancialPeriod, error)
	GetCurrentFinancialPeriod(ctx context.Context, companyID string) (*entities.FinancialPeriod, error)
	GetOpenFinancialPeriods(ctx context.Context, companyID string) ([]*entities.FinancialPeriod, error)
	GetClosedFinancialPeriods(ctx context.Context, companyID string) ([]*entities.FinancialPeriod, error)

	// Period management
	CloseFinancialPeriod(ctx context.Context, id uuid.UUID, userID string) error
	ReopenFinancialPeriod(ctx context.Context, id uuid.UUID) error
}
