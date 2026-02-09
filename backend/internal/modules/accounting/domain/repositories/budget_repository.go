package repositories

import (
	"context"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/shared/uuid"
)

// BudgetRepository defines methods for budget operations
type BudgetRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, budget *entities.Budget) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Budget, error)
	GetAll(ctx context.Context) ([]*entities.Budget, error)
	Update(ctx context.Context, budget *entities.Budget) error
	Delete(ctx context.Context, id uuid.ID) error

	// Budget lines operations
	CreateLine(ctx context.Context, line *entities.BudgetLine) error
	GetLinesByBudgetID(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetLine, error)
	UpdateLine(ctx context.Context, line *entities.BudgetLine) error
	DeleteLine(ctx context.Context, lineID uuid.ID) error
	DeleteLinesByBudgetID(ctx context.Context, budgetID uuid.ID) error

	// Query operations
	GetByCode(ctx context.Context, budgetCode string) (*entities.Budget, error)
	GetByType(ctx context.Context, budgetType entities.BudgetType) ([]*entities.Budget, error)
	GetByStatus(ctx context.Context, status entities.BudgetStatus) ([]*entities.Budget, error)
	GetByFiscalYear(ctx context.Context, companyID string, fiscalYear int) ([]*entities.Budget, error)
	GetByPeriod(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.Budget, error)
	
	// Company-specific operations
	GetByCompanyID(ctx context.Context, companyID string) ([]*entities.Budget, error)
	GetActiveByCompany(ctx context.Context, companyID string) ([]*entities.Budget, error)
	GetCurrentBudget(ctx context.Context, companyID string, budgetType entities.BudgetType) (*entities.Budget, error)
	
	// Budget management operations
	Activate(ctx context.Context, budgetID uuid.ID, userID string) error
	Close(ctx context.Context, budgetID uuid.ID) error
	Revise(ctx context.Context, budgetID uuid.ID, newBudget *entities.Budget) error
	
	// Budget comparison operations
	GetBudgetComparison(ctx context.Context, budgetID uuid.ID, asOfDate time.Time) ([]entities.BudgetComparison, error)
	UpdateActualAmounts(ctx context.Context, budgetID uuid.ID, periodStart, periodEnd time.Time) error
	
	// Reporting operations
	GetBudgetVarianceReport(ctx context.Context, companyID string, budgetType entities.BudgetType, asOfDate time.Time) ([]*entities.BudgetLine, error)
	GetBudgetUtilization(ctx context.Context, budgetID uuid.ID) (float64, error)
	GetBudgetPerformance(ctx context.Context, companyID string, fiscalYear int) (map[string]float64, error)
	
	// Batch operations
	CreateWithLines(ctx context.Context, budget *entities.Budget) error
	UpdateWithLines(ctx context.Context, budget *entities.Budget) error
	
	// Historical operations
	GetBudgetHistory(ctx context.Context, companyID string, accountID uuid.ID) ([]*entities.BudgetLine, error)
	GetQuarterlyBudgets(ctx context.Context, companyID string, fiscalYear int) ([]*entities.Budget, error)
}