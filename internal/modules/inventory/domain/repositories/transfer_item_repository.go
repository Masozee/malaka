package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// TransferItemRepository defines the interface for transfer item data operations.
type TransferItemRepository interface {
	Create(ctx context.Context, item *entities.TransferItem) error
	GetByID(ctx context.Context, id string) (*entities.TransferItem, error)
	Update(ctx context.Context, item *entities.TransferItem) error
	Delete(ctx context.Context, id string) error
}
