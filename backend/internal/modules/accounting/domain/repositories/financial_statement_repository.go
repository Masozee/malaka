package repositories

import (
	"context"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/shared/uuid"
)

// FinancialStatementRepository defines methods for financial statement operations
type FinancialStatementRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, statement *entities.FinancialStatement) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.FinancialStatement, error)
	GetAll(ctx context.Context) ([]*entities.FinancialStatement, error)
	Update(ctx context.Context, statement *entities.FinancialStatement) error
	Delete(ctx context.Context, id uuid.ID) error

	// Query operations
	GetByType(ctx context.Context, statementType entities.FinancialStatementType) ([]*entities.FinancialStatement, error)
	GetByCompanyID(ctx context.Context, companyID string) ([]*entities.FinancialStatement, error)
	GetByCompanyAndType(ctx context.Context, companyID string, statementType entities.FinancialStatementType) ([]*entities.FinancialStatement, error)
	GetByPeriod(ctx context.Context, companyID string, statementType entities.FinancialStatementType, periodStart, periodEnd time.Time) (*entities.FinancialStatement, error)
	GetLatest(ctx context.Context, companyID string, statementType entities.FinancialStatementType) (*entities.FinancialStatement, error)
	
	// Balance Sheet operations
	GenerateBalanceSheet(ctx context.Context, companyID string, asOfDate time.Time) (*entities.BalanceSheet, error)
	GetBalanceSheetData(ctx context.Context, companyID string, asOfDate time.Time) ([]entities.FinancialStatementSection, error)
	
	// Income Statement operations
	GenerateIncomeStatement(ctx context.Context, companyID string, periodStart, periodEnd time.Time) (*entities.IncomeStatement, error)
	GetIncomeStatementData(ctx context.Context, companyID string, periodStart, periodEnd time.Time) ([]entities.FinancialStatementSection, error)
	
	// Cash Flow Statement operations
	GenerateCashFlowStatement(ctx context.Context, companyID string, periodStart, periodEnd time.Time) (*entities.CashFlowStatement, error)
	GetCashFlowData(ctx context.Context, companyID string, periodStart, periodEnd time.Time) ([]entities.FinancialStatementSection, error)
	
	// Comparative operations
	GetComparativeStatements(ctx context.Context, companyID string, statementType entities.FinancialStatementType, periods []time.Time) ([]*entities.FinancialStatement, error)
	
	// Validation operations
	ValidateBalanceSheet(ctx context.Context, statementID uuid.ID) (bool, error)
	
	// Reporting operations
	GetFinancialRatios(ctx context.Context, companyID string, asOfDate time.Time) (map[string]float64, error)
	GetTrendAnalysis(ctx context.Context, companyID string, statementType entities.FinancialStatementType, fromDate, toDate time.Time) ([]entities.FinancialStatementItem, error)
}