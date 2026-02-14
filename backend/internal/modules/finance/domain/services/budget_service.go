package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

// BudgetService provides business logic for budget operations.
type BudgetService struct {
	repo repositories.BudgetRepository
}

// NewBudgetService creates a new BudgetService.
func NewBudgetService(repo repositories.BudgetRepository) *BudgetService {
	return &BudgetService{repo: repo}
}

// CreateBudget creates a new budget.
func (s *BudgetService) CreateBudget(ctx context.Context, b *entities.Budget) error {
	if b.ID.IsNil() {
		b.ID = uuid.New()
	}
	return s.repo.Create(ctx, b)
}

// GetBudgetByID retrieves a budget by its ID.
func (s *BudgetService) GetBudgetByID(ctx context.Context, id uuid.ID) (*entities.Budget, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllBudgets retrieves all budgets.
func (s *BudgetService) GetAllBudgets(ctx context.Context) ([]*entities.Budget, error) {
	return s.repo.GetAll(ctx)
}

// UpdateBudget updates an existing budget.
func (s *BudgetService) UpdateBudget(ctx context.Context, b *entities.Budget) error {
	// Ensure the budget exists before updating
	existingB, err := s.repo.GetByID(ctx, b.ID)
	if err != nil {
		return err
	}
	if existingB == nil {
		return errors.New("budget not found")
	}
	return s.repo.Update(ctx, b)
}

// DeleteBudget deletes a budget by its ID.
func (s *BudgetService) DeleteBudget(ctx context.Context, id uuid.ID) error {
	// Ensure the budget exists before deleting
	existingB, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingB == nil {
		return errors.New("budget not found")
	}
	return s.repo.Delete(ctx, id)
}
