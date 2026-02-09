package services

import (
	"context"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/shared/uuid"
)

// BudgetService defines the interface for budget business logic
type BudgetService interface {
	// Basic CRUD operations
	CreateBudget(ctx context.Context, budget *entities.Budget) error
	GetBudgetByID(ctx context.Context, id uuid.ID) (*entities.Budget, error)
	GetAllBudgets(ctx context.Context) ([]*entities.Budget, error)
	UpdateBudget(ctx context.Context, budget *entities.Budget) error
	DeleteBudget(ctx context.Context, id uuid.ID) error

	// Budget line operations
	AddBudgetLine(ctx context.Context, budgetID uuid.ID, line *entities.BudgetLine) error
	UpdateBudgetLine(ctx context.Context, line *entities.BudgetLine) error
	DeleteBudgetLine(ctx context.Context, lineID uuid.ID) error
	GetBudgetLines(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetLine, error)

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
	ActivateBudget(ctx context.Context, budgetID uuid.ID, userID string) error
	CloseBudget(ctx context.Context, budgetID uuid.ID) error
	ReviseBudget(ctx context.Context, budgetID uuid.ID, newBudget *entities.Budget) error
	
	// Budget analysis operations
	GetBudgetComparison(ctx context.Context, budgetID uuid.ID, asOfDate time.Time) ([]entities.BudgetComparison, error)
	UpdateActualAmounts(ctx context.Context, budgetID uuid.ID) error
	GetBudgetVarianceReport(ctx context.Context, companyID string, budgetType entities.BudgetType, asOfDate time.Time) ([]*entities.BudgetLine, error)
	GetBudgetUtilization(ctx context.Context, budgetID uuid.ID) (float64, error)
	GetBudgetPerformance(ctx context.Context, companyID string, fiscalYear int) (map[string]float64, error)
	
	// Batch operations
	CreateBudgetWithLines(ctx context.Context, budget *entities.Budget) error
	UpdateBudgetWithLines(ctx context.Context, budget *entities.Budget) error
	
	// Historical operations
	GetBudgetHistory(ctx context.Context, companyID string, accountID uuid.ID) ([]*entities.BudgetLine, error)
	GetQuarterlyBudgets(ctx context.Context, companyID string, fiscalYear int) ([]*entities.Budget, error)
	
	// Budget validation and business rules
	ValidateBudgetPeriod(ctx context.Context, companyID string, budgetType entities.BudgetType, startDate, endDate time.Time) error
	CheckBudgetOverlap(ctx context.Context, companyID string, budgetType entities.BudgetType, startDate, endDate time.Time, excludeBudgetID *uuid.ID) error
	CalculateBudgetTotals(ctx context.Context, budgetID uuid.ID) error
	
	// Budget forecasting
	ForecastBudget(ctx context.Context, budgetID uuid.ID, projectionMonths int) (*entities.Budget, error)
	CompareBudgetYearOverYear(ctx context.Context, companyID string, budgetType entities.BudgetType, currentYear, previousYear int) (map[string]interface{}, error)

	// Budget commitment operations
	CreateCommitment(ctx context.Context, commitment *entities.BudgetCommitment) error
	GetCommitmentByReferenceID(ctx context.Context, refType entities.BudgetCommitmentReferenceType, refID uuid.ID) (*entities.BudgetCommitment, error)
	ReleaseCommitment(ctx context.Context, commitmentID uuid.ID, releasedBy uuid.ID, reason string) error

	// Budget realization operations
	CreateRealization(ctx context.Context, realization *entities.BudgetRealization) error
	CreateRealizationFromGR(ctx context.Context, grID uuid.ID, grNumber string, amount float64, accountID uuid.ID, transactionDate time.Time, realizedBy uuid.ID, poID *uuid.ID) error
	GetRealizationSummary(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetRealizationSummary, error)
}