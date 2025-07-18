package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// ReturnSupplierRepository defines the interface for return supplier data operations.
type ReturnSupplierRepository interface {
	Create(ctx context.Context, rs *entities.ReturnSupplier) error
	GetAll(ctx context.Context) ([]*entities.ReturnSupplier, error)
	GetByID(ctx context.Context, id string) (*entities.ReturnSupplier, error)
	Update(ctx context.Context, rs *entities.ReturnSupplier) error
	Delete(ctx context.Context, id string) error
}
