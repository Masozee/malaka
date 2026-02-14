package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// BudgetRepository defines the interface for budget data operations.
type BudgetRepository interface {
	Create(ctx context.Context, b *entities.Budget) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Budget, error)
	GetAll(ctx context.Context) ([]*entities.Budget, error)
	Update(ctx context.Context, b *entities.Budget) error
	Delete(ctx context.Context, id uuid.ID) error
}
