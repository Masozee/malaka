package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// StockOpnameRepository defines the interface for stock opname data operations.
type StockOpnameRepository interface {
	Create(ctx context.Context, so *entities.StockOpname) error
	GetByID(ctx context.Context, id string) (*entities.StockOpname, error)
	GetAll(ctx context.Context) ([]*entities.StockOpname, error)
	Update(ctx context.Context, so *entities.StockOpname) error
	Delete(ctx context.Context, id string) error
}
