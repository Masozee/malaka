package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// TransferOrderRepository defines the interface for transfer order data operations.
type TransferOrderRepository interface {
	Create(ctx context.Context, to *entities.TransferOrder) error
	GetByID(ctx context.Context, id string) (*entities.TransferOrder, error)
	GetAll(ctx context.Context) ([]*entities.TransferOrder, error)
	Update(ctx context.Context, to *entities.TransferOrder) error
	Delete(ctx context.Context, id string) error
}
