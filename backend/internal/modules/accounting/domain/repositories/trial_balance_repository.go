package repositories

import (
	"context"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/shared/uuid"
)

// TrialBalanceRepository defines methods for trial balance operations
type TrialBalanceRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, trialBalance *entities.TrialBalance) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.TrialBalance, error)
	GetAll(ctx context.Context) ([]*entities.TrialBalance, error)
	Update(ctx context.Context, trialBalance *entities.TrialBalance) error
	Delete(ctx context.Context, id uuid.ID) error

	// Query operations
	GetByCompanyID(ctx context.Context, companyID string) ([]*entities.TrialBalance, error)
	GetByPeriod(ctx context.Context, companyID string, periodStart, periodEnd time.Time) (*entities.TrialBalance, error)
	GetLatest(ctx context.Context, companyID string) (*entities.TrialBalance, error)
	GetByDateRange(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.TrialBalance, error)
	
	// Generation operations
	GenerateTrialBalance(ctx context.Context, companyID string, periodStart, periodEnd time.Time) (*entities.TrialBalance, error)
	CalculateAccountBalances(ctx context.Context, companyID string, periodStart, periodEnd time.Time) ([]entities.TrialBalanceAccount, error)
	
	// Account-specific operations
	GetAccountBalance(ctx context.Context, companyID string, accountID uuid.ID, asOfDate time.Time) (*entities.TrialBalanceAccount, error)
	GetAccountsByType(ctx context.Context, companyID string, accountType string, asOfDate time.Time) ([]entities.TrialBalanceAccount, error)
	
	// Reporting operations
	GetTrialBalanceSummary(ctx context.Context, companyID string, asOfDate time.Time) (*entities.TrialBalanceSummary, error)
	ValidateTrialBalance(ctx context.Context, trialBalanceID uuid.ID) (bool, error)
	
	// Historical operations
	GetHistoricalTrialBalances(ctx context.Context, companyID string, fromDate, toDate time.Time) ([]*entities.TrialBalance, error)
	GetMonthEndTrialBalances(ctx context.Context, companyID string, year int) ([]*entities.TrialBalance, error)
	
	// Comparative operations
	CompareTrialBalances(ctx context.Context, companyID string, fromPeriod, toPeriod time.Time) ([]entities.TrialBalanceAccount, error)
}