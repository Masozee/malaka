package services

import (
	"context"
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// TrialBalanceService defines business logic operations for trial balance
type TrialBalanceService interface {
	// Basic CRUD operations
	CreateTrialBalance(ctx context.Context, trialBalance *entities.TrialBalance) (*entities.TrialBalance, error)
	GetTrialBalanceByID(ctx context.Context, id uuid.ID) (*entities.TrialBalance, error)
	GetAllTrialBalances(ctx context.Context) ([]*entities.TrialBalance, error)
	UpdateTrialBalance(ctx context.Context, trialBalance *entities.TrialBalance) (*entities.TrialBalance, error)
	DeleteTrialBalance(ctx context.Context, id uuid.ID) error

	// Company and period specific operations
	GetTrialBalancesByCompany(ctx context.Context, companyID string) ([]*entities.TrialBalance, error)
	GetTrialBalanceByPeriod(ctx context.Context, companyID string, periodStart, periodEnd time.Time) (*entities.TrialBalance, error)
	GetLatestTrialBalance(ctx context.Context, companyID string) (*entities.TrialBalance, error)
	GetTrialBalancesByDateRange(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.TrialBalance, error)

	// Generation and calculation operations
	GenerateTrialBalance(ctx context.Context, companyID string, periodStart, periodEnd time.Time, createdBy string) (*entities.TrialBalance, error)
	RegenerateTrialBalance(ctx context.Context, companyID string, periodStart, periodEnd time.Time, createdBy string) (*entities.TrialBalance, error)
	CalculateAccountBalances(ctx context.Context, companyID string, periodStart, periodEnd time.Time) ([]entities.TrialBalanceAccount, error)

	// Account-specific operations
	GetAccountBalance(ctx context.Context, companyID string, accountID uuid.ID, asOfDate time.Time) (*entities.TrialBalanceAccount, error)
	GetAccountsByType(ctx context.Context, companyID string, accountType string, asOfDate time.Time) ([]entities.TrialBalanceAccount, error)

	// Reporting and analysis operations
	GetTrialBalanceSummary(ctx context.Context, companyID string, asOfDate time.Time) (*entities.TrialBalanceSummary, error)
	ValidateTrialBalance(ctx context.Context, trialBalanceID uuid.ID) (bool, []string, error)
	GetAccountTypesSummary(ctx context.Context, companyID string, asOfDate time.Time) (map[string]float64, error)

	// Historical and comparative operations
	GetHistoricalTrialBalances(ctx context.Context, companyID string, fromDate, toDate time.Time) ([]*entities.TrialBalance, error)
	GetMonthEndTrialBalances(ctx context.Context, companyID string, year int) ([]*entities.TrialBalance, error)
	CompareTrialBalances(ctx context.Context, companyID string, fromPeriod, toPeriod time.Time) ([]entities.TrialBalanceAccount, error)
	// GetPeriodOverPeriodAnalysis(ctx context.Context, companyID string, fromPeriod, toPeriod time.Time) (*entities.TrialBalanceComparison, error)

	// Financial statement preparation - TODO: implement when entities are available
	// GetAssetsAndLiabilities(ctx context.Context, companyID string, asOfDate time.Time) (*entities.BalanceSheetData, error)
	// GetRevenuesAndExpenses(ctx context.Context, companyID string, periodStart, periodEnd time.Time) (*entities.IncomeStatementData, error)

	// Audit and compliance operations - TODO: implement when entities are available
	// GetTrialBalanceAuditTrail(ctx context.Context, trialBalanceID uuid.ID) ([]entities.AuditEntry, error)
	// VerifyTrialBalanceIntegrity(ctx context.Context, companyID string, asOfDate time.Time) (*entities.IntegrityReport, error)

	// Bulk operations
	GenerateMonthlyTrialBalances(ctx context.Context, companyID string, year int, createdBy string) ([]*entities.TrialBalance, error)
	RegenerateHistoricalTrialBalances(ctx context.Context, companyID string, fromDate, toDate time.Time, createdBy string) ([]*entities.TrialBalance, error)

	// Export operations
	ExportTrialBalanceToCSV(ctx context.Context, trialBalanceID uuid.ID) ([]byte, error)
	ExportTrialBalanceToExcel(ctx context.Context, trialBalanceID uuid.ID) ([]byte, error)
}