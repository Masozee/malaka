package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// SalesKompetitorRepository defines the interface for sales competitor data operations.
type SalesKompetitorRepository interface {
	Create(ctx context.Context, sk *entities.SalesKompetitor) error
	GetByID(ctx context.Context, id string) (*entities.SalesKompetitor, error)
	GetAll(ctx context.Context) ([]*entities.SalesKompetitor, error)
	Update(ctx context.Context, sk *entities.SalesKompetitor) error
	Delete(ctx context.Context, id string) error
}
