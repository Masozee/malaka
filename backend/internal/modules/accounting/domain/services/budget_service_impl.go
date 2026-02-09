package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
	"malaka/internal/shared/uuid"
)

// budgetService implements BudgetService
type budgetService struct {
	repo             repositories.BudgetRepository
	commitmentRepo   repositories.BudgetCommitmentRepository
	realizationRepo  repositories.BudgetRealizationRepository
}

// NewBudgetService creates a new instance of BudgetService
func NewBudgetService(repo repositories.BudgetRepository) BudgetService {
	return &budgetService{repo: repo}
}

// NewBudgetServiceWithRepos creates a new instance of BudgetService with all repositories
func NewBudgetServiceWithRepos(repo repositories.BudgetRepository, commitmentRepo repositories.BudgetCommitmentRepository, realizationRepo repositories.BudgetRealizationRepository) BudgetService {
	return &budgetService{
		repo:            repo,
		commitmentRepo:  commitmentRepo,
		realizationRepo: realizationRepo,
	}
}

// SetCommitmentRepo sets the commitment repository
func (s *budgetService) SetCommitmentRepo(repo repositories.BudgetCommitmentRepository) {
	s.commitmentRepo = repo
}

// SetRealizationRepo sets the realization repository
func (s *budgetService) SetRealizationRepo(repo repositories.BudgetRealizationRepository) {
	s.realizationRepo = repo
}

// CreateBudget creates a new budget
func (s *budgetService) CreateBudget(ctx context.Context, budget *entities.Budget) error {
	// Add business logic/validation here
	if budget.CompanyID == "" || budget.FiscalYear == 0 || budget.BudgetType == "" {
		return errors.New("company ID, fiscal year, and budget type are required")
	}

	// Check for overlapping budgets if period-based
	if budget.PeriodStart.IsZero() || budget.PeriodEnd.IsZero() {
		return errors.New("start date and end date are required for period-based budgets")
	}

	// Set creation and update timestamps
	budget.CreatedAt = time.Now()
	budget.UpdatedAt = time.Now()

	return s.repo.Create(ctx, budget)
}

// GetBudgetByID retrieves a budget by its ID
func (s *budgetService) GetBudgetByID(ctx context.Context, id uuid.ID) (*entities.Budget, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllBudgets retrieves all budgets
func (s *budgetService) GetAllBudgets(ctx context.Context) ([]*entities.Budget, error) {
	return s.repo.GetAll(ctx)
}

// UpdateBudget updates an existing budget
func (s *budgetService) UpdateBudget(ctx context.Context, budget *entities.Budget) error {
	// Ensure the budget exists before updating
	existingBudget, err := s.repo.GetByID(ctx, budget.ID)
	if err != nil {
		return fmt.Errorf("failed to check for existing budget: %w", err)
	}
	if existingBudget == nil {
		return fmt.Errorf("budget with ID %s not found", budget.ID)
	}

	// Set update timestamp
	budget.UpdatedAt = time.Now()

	return s.repo.Update(ctx, budget)
}

// DeleteBudget deletes a budget by its ID
func (s *budgetService) DeleteBudget(ctx context.Context, id uuid.ID) error {
	// Ensure the budget exists before deleting
	existingBudget, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check for existing budget: %w", err)
	}
	if existingBudget == nil {
		return fmt.Errorf("budget with ID %s not found", id)
	}

	return s.repo.Delete(ctx, id)
}

// AddBudgetLine adds a new budget line to a budget
func (s *budgetService) AddBudgetLine(ctx context.Context, budgetID uuid.ID, line *entities.BudgetLine) error {
	// Placeholder for actual logic
	return nil
}

// UpdateBudgetLine updates an existing budget line
func (s *budgetService) UpdateBudgetLine(ctx context.Context, line *entities.BudgetLine) error {
	// Placeholder for actual logic
	return nil
}

// DeleteBudgetLine deletes a budget line
func (s *budgetService) DeleteBudgetLine(ctx context.Context, lineID uuid.ID) error {
	// Placeholder for actual logic
	return nil
}

// GetBudgetLines retrieves budget lines for a given budget
func (s *budgetService) GetBudgetLines(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetLine, error) {
	// Placeholder for actual logic
	return []*entities.BudgetLine{}, nil
}

// GetBudgetByCode retrieves a budget by its code
func (s *budgetService) GetBudgetByCode(ctx context.Context, budgetCode string) (*entities.Budget, error) {
	// Placeholder for actual logic
	return &entities.Budget{}, nil
}

// GetBudgetsByType retrieves budgets by type
func (s *budgetService) GetBudgetsByType(ctx context.Context, budgetType entities.BudgetType) ([]*entities.Budget, error) {
	// Placeholder for actual logic
	return []*entities.Budget{}, nil
}

// GetBudgetsByStatus retrieves budgets by status
func (s *budgetService) GetBudgetsByStatus(ctx context.Context, status entities.BudgetStatus) ([]*entities.Budget, error) {
	// Placeholder for actual logic
	return []*entities.Budget{}, nil
}

// GetBudgetsByFiscalYear retrieves budgets by fiscal year
func (s *budgetService) GetBudgetsByFiscalYear(ctx context.Context, companyID string, fiscalYear int) ([]*entities.Budget, error) {
	// Placeholder for actual logic
	return []*entities.Budget{}, nil
}

// GetBudgetsByPeriod retrieves budgets by period
func (s *budgetService) GetBudgetsByPeriod(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.Budget, error) {
	// Placeholder for actual logic
	return []*entities.Budget{}, nil
}

// GetBudgetsByCompany retrieves budgets by company
func (s *budgetService) GetBudgetsByCompany(ctx context.Context, companyID string) ([]*entities.Budget, error) {
	// Placeholder for actual logic
	return []*entities.Budget{}, nil
}

// GetActiveBudgetsByCompany retrieves active budgets by company
func (s *budgetService) GetActiveBudgetsByCompany(ctx context.Context, companyID string) ([]*entities.Budget, error) {
	// Placeholder for actual logic
	return []*entities.Budget{}, nil
}

// GetCurrentBudget retrieves the current budget
func (s *budgetService) GetCurrentBudget(ctx context.Context, companyID string, budgetType entities.BudgetType) (*entities.Budget, error) {
	// Placeholder for actual logic
	return &entities.Budget{}, nil
}

// ActivateBudget activates a budget
func (s *budgetService) ActivateBudget(ctx context.Context, budgetID uuid.ID, userID string) error {
	// Placeholder for actual logic
	return nil
}

// CloseBudget closes a budget
func (s *budgetService) CloseBudget(ctx context.Context, budgetID uuid.ID) error {
	// Placeholder for actual logic
	return nil
}

// ReviseBudget revises a budget
func (s *budgetService) ReviseBudget(ctx context.Context, budgetID uuid.ID, newBudget *entities.Budget) error {
	// Placeholder for actual logic
	return nil
}

// GetBudgetComparison retrieves budget comparison
func (s *budgetService) GetBudgetComparison(ctx context.Context, budgetID uuid.ID, asOfDate time.Time) ([]entities.BudgetComparison, error) {
	// Placeholder for actual logic
	return []entities.BudgetComparison{}, nil
}

// UpdateActualAmounts updates actual amounts for a budget
func (s *budgetService) UpdateActualAmounts(ctx context.Context, budgetID uuid.ID) error {
	// Placeholder for actual logic
	return nil
}

// GetBudgetVarianceReport retrieves budget variance report
func (s *budgetService) GetBudgetVarianceReport(ctx context.Context, companyID string, budgetType entities.BudgetType, asOfDate time.Time) ([]*entities.BudgetLine, error) {
	// Placeholder for actual logic
	return []*entities.BudgetLine{}, nil
}

// GetBudgetUtilization retrieves budget utilization
func (s *budgetService) GetBudgetUtilization(ctx context.Context, budgetID uuid.ID) (float64, error) {
	// Placeholder for actual logic
	return 0.0, nil
}

// GetBudgetPerformance retrieves budget performance
func (s *budgetService) GetBudgetPerformance(ctx context.Context, companyID string, fiscalYear int) (map[string]float64, error) {
	// Placeholder for actual logic
	return map[string]float64{}, nil
}

// CreateBudgetWithLines creates a budget with lines
func (s *budgetService) CreateBudgetWithLines(ctx context.Context, budget *entities.Budget) error {
	// Placeholder for actual logic
	return nil
}

// UpdateBudgetWithLines updates a budget with lines
func (s *budgetService) UpdateBudgetWithLines(ctx context.Context, budget *entities.Budget) error {
	// Placeholder for actual logic
	return nil
}

// GetBudgetHistory retrieves budget history
func (s *budgetService) GetBudgetHistory(ctx context.Context, companyID string, accountID uuid.ID) ([]*entities.BudgetLine, error) {
	// Placeholder for actual logic
	return []*entities.BudgetLine{}, nil
}

// GetQuarterlyBudgets retrieves quarterly budgets
func (s *budgetService) GetQuarterlyBudgets(ctx context.Context, companyID string, fiscalYear int) ([]*entities.Budget, error) {
	// Placeholder for actual logic
	return []*entities.Budget{}, nil
}

// ValidateBudgetPeriod validates budget period
func (s *budgetService) ValidateBudgetPeriod(ctx context.Context, companyID string, budgetType entities.BudgetType, startDate, endDate time.Time) error {
	// Placeholder for actual logic
	return nil
}

// CheckBudgetOverlap checks for budget overlap
func (s *budgetService) CheckBudgetOverlap(ctx context.Context, companyID string, budgetType entities.BudgetType, startDate, endDate time.Time, excludeBudgetID *uuid.ID) error {
	// Placeholder for actual logic
	return nil
}

// CalculateBudgetTotals calculates budget totals
func (s *budgetService) CalculateBudgetTotals(ctx context.Context, budgetID uuid.ID) error {
	// Placeholder for actual logic
	return nil
}

// ForecastBudget forecasts budget
func (s *budgetService) ForecastBudget(ctx context.Context, budgetID uuid.ID, projectionMonths int) (*entities.Budget, error) {
	// Placeholder for actual logic
	return &entities.Budget{}, nil
}

// CompareBudgetYearOverYear compares budget year over year
func (s *budgetService) CompareBudgetYearOverYear(ctx context.Context, companyID string, budgetType entities.BudgetType, currentYear, previousYear int) (map[string]interface{}, error) {
	// Placeholder for actual logic
	return map[string]interface{}{}, nil
}

// CreateCommitment creates a new budget commitment
func (s *budgetService) CreateCommitment(ctx context.Context, commitment *entities.BudgetCommitment) error {
	if s.commitmentRepo == nil {
		return errors.New("commitment repository not configured")
	}
	return s.commitmentRepo.Create(ctx, commitment)
}

// GetCommitmentByReferenceID retrieves a commitment by reference ID
func (s *budgetService) GetCommitmentByReferenceID(ctx context.Context, refType entities.BudgetCommitmentReferenceType, refID uuid.ID) (*entities.BudgetCommitment, error) {
	if s.commitmentRepo == nil {
		return nil, errors.New("commitment repository not configured")
	}
	return s.commitmentRepo.GetByReferenceID(ctx, refType, refID)
}

// ReleaseCommitment releases a budget commitment
func (s *budgetService) ReleaseCommitment(ctx context.Context, commitmentID uuid.ID, releasedBy uuid.ID, reason string) error {
	if s.commitmentRepo == nil {
		return errors.New("commitment repository not configured")
	}
	return s.commitmentRepo.Release(ctx, commitmentID, releasedBy, reason)
}

// CreateRealization creates a new budget realization
func (s *budgetService) CreateRealization(ctx context.Context, realization *entities.BudgetRealization) error {
	if s.realizationRepo == nil {
		return errors.New("realization repository not configured")
	}
	return s.realizationRepo.Create(ctx, realization)
}

// CreateRealizationFromGR creates a budget realization from a goods receipt
func (s *budgetService) CreateRealizationFromGR(ctx context.Context, grID uuid.ID, grNumber string, amount float64, accountID uuid.ID, transactionDate time.Time, realizedBy uuid.ID, poID *uuid.ID) error {
	if s.realizationRepo == nil {
		return errors.New("realization repository not configured")
	}
	if s.commitmentRepo == nil {
		return errors.New("commitment repository not configured")
	}

	// Try to find the commitment from the PO
	var commitmentID *uuid.ID
	var budgetID uuid.ID

	if poID != nil {
		commitment, err := s.commitmentRepo.GetByReferenceID(ctx, entities.BudgetCommitmentRefPurchaseOrder, *poID)
		if err != nil {
			return fmt.Errorf("failed to find commitment for PO: %w", err)
		}
		if commitment != nil {
			commitmentID = &commitment.ID
			budgetID = commitment.BudgetID

			// Mark the commitment as realized
			if err := s.commitmentRepo.MarkRealized(ctx, commitment.ID); err != nil {
				return fmt.Errorf("failed to mark commitment as realized: %w", err)
			}
		}
	}

	// If no commitment found, try to find an active budget for the current period
	if budgetID == uuid.Nil {
		// Use a default budget or skip realization if no budget exists
		// For now, we'll skip creating realization if no budget is found
		return nil
	}

	// Create the realization record
	realization := entities.NewBudgetRealization(
		budgetID,
		accountID,
		grID,
		realizedBy,
		amount,
		entities.BudgetRealizationRefGoodsReceipt,
		grNumber,
		fmt.Sprintf("Budget realization from Goods Receipt %s", grNumber),
		transactionDate,
		commitmentID,
	)

	return s.realizationRepo.Create(ctx, realization)
}

// GetRealizationSummary retrieves budget realization summary
func (s *budgetService) GetRealizationSummary(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetRealizationSummary, error) {
	if s.realizationRepo == nil {
		return nil, errors.New("realization repository not configured")
	}
	return s.realizationRepo.GetRealizationSummary(ctx, budgetID)
}
