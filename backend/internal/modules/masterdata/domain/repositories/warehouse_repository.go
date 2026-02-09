package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// WarehouseRepository defines the interface for warehouse data operations.
type WarehouseRepository interface {
	Create(ctx context.Context, warehouse *entities.Warehouse) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Warehouse, error)
	GetAll(ctx context.Context) ([]*entities.Warehouse, error)
	Update(ctx context.Context, warehouse *entities.Warehouse) error
	Delete(ctx context.Context, id uuid.ID) error
}
