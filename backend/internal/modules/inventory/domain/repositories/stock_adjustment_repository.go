package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// StockAdjustmentRepository defines the interface for stock adjustment data operations.
type StockAdjustmentRepository interface {
	Create(ctx context.Context, sa *entities.StockAdjustment) error
	GetByID(ctx context.Context, id string) (*entities.StockAdjustment, error)
	GetAll(ctx context.Context) ([]*entities.StockAdjustment, error)
	Update(ctx context.Context, sa *entities.StockAdjustment) error
	Delete(ctx context.Context, id string) error
}
