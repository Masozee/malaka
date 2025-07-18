package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
)

// SupplierRepository defines the interface for supplier data operations.
type SupplierRepository interface {
	Create(ctx context.Context, supplier *entities.Supplier) error
	GetByID(ctx context.Context, id string) (*entities.Supplier, error)
	GetAll(ctx context.Context) ([]*entities.Supplier, error)
	Update(ctx context.Context, supplier *entities.Supplier) error
	Delete(ctx context.Context, id string) error
}
