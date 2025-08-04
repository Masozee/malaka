package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// BudgetService defines the interface for budget business logic
type BudgetService interface {
	// Basic CRUD operations
	CreateBudget(ctx context.Context, budget *entities.Budget) error
	GetBudgetByID(ctx context.Context, id uuid.UUID) (*entities.Budget, error)
	GetAllBudgets(ctx context.Context) ([]*entities.Budget, error)
	UpdateBudget(ctx context.Context, budget *entities.Budget) error
	DeleteBudget(ctx context.Context, id uuid.UUID) error

	// Budget line operations
	AddBudgetLine(ctx context.Context, budgetID uuid.UUID, line *entities.BudgetLine) error
	UpdateBudgetLine(ctx context.Context, line *entities.BudgetLine) error
	DeleteBudgetLine(ctx context.Context, lineID uuid.UUID) error
	GetBudgetLines(ctx context.Context, budgetID uuid.UUID) ([]*entities.BudgetLine, error)

	// Query operations
	GetBudgetByCode(ctx context.Context, budgetCode string) (*entities.Budget, error)
	GetBudgetsByType(ctx context.Context, budgetType entities.BudgetType) ([]*entities.Budget, error)
	GetBudgetsByStatus(ctx context.Context, status entities.BudgetStatus) ([]*entities.Budget, error)
	GetBudgetsByFiscalYear(ctx context.Context, companyID string, fiscalYear int) ([]*entities.Budget, error)
	GetBudgetsByPeriod(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.Budget, error)
	
	// Company-specific operations
	GetBudgetsByCompany(ctx context.Context, companyID string) ([]*entities.Budget, error)
	GetActiveBudgetsByCompany(ctx context.Context, companyID string) ([]*entities.Budget, error)
	GetCurrentBudget(ctx context.Context, companyID string, budgetType entities.BudgetType) (*entities.Budget, error)
	
	// Budget management operations
	ActivateBudget(ctx context.Context, budgetID uuid.UUID, userID string) error
	CloseBudget(ctx context.Context, budgetID uuid.UUID) error
	ReviseBudget(ctx context.Context, budgetID uuid.UUID, newBudget *entities.Budget) error
	
	// Budget analysis operations
	GetBudgetComparison(ctx context.Context, budgetID uuid.UUID, asOfDate time.Time) ([]entities.BudgetComparison, error)
	UpdateActualAmounts(ctx context.Context, budgetID uuid.UUID) error
	GetBudgetVarianceReport(ctx context.Context, companyID string, budgetType entities.BudgetType, asOfDate time.Time) ([]*entities.BudgetLine, error)
	GetBudgetUtilization(ctx context.Context, budgetID uuid.UUID) (float64, error)
	GetBudgetPerformance(ctx context.Context, companyID string, fiscalYear int) (map[string]float64, error)
	
	// Batch operations
	CreateBudgetWithLines(ctx context.Context, budget *entities.Budget) error
	UpdateBudgetWithLines(ctx context.Context, budget *entities.Budget) error
	
	// Historical operations
	GetBudgetHistory(ctx context.Context, companyID string, accountID uuid.UUID) ([]*entities.BudgetLine, error)
	GetQuarterlyBudgets(ctx context.Context, companyID string, fiscalYear int) ([]*entities.Budget, error)
	
	// Budget validation and business rules
	ValidateBudgetPeriod(ctx context.Context, companyID string, budgetType entities.BudgetType, startDate, endDate time.Time) error
	CheckBudgetOverlap(ctx context.Context, companyID string, budgetType entities.BudgetType, startDate, endDate time.Time, excludeBudgetID *uuid.UUID) error
	CalculateBudgetTotals(ctx context.Context, budgetID uuid.UUID) error
	
	// Budget forecasting
	ForecastBudget(ctx context.Context, budgetID uuid.UUID, projectionMonths int) (*entities.Budget, error)
	CompareBudgetYearOverYear(ctx context.Context, companyID string, budgetType entities.BudgetType, currentYear, previousYear int) (map[string]interface{}, error)
}