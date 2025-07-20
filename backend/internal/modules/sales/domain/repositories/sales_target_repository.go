package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// SalesTargetRepository defines the interface for sales target data operations.
type SalesTargetRepository interface {
	Create(ctx context.Context, target *entities.SalesTarget) error
	GetByID(ctx context.Context, id string) (*entities.SalesTarget, error)
	GetAll(ctx context.Context) ([]*entities.SalesTarget, error)
	Update(ctx context.Context, target *entities.SalesTarget) error
	Delete(ctx context.Context, id string) error
}
