package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// PosItemRepository defines the interface for POS item data operations.
type PosItemRepository interface {
	Create(ctx context.Context, item *entities.PosItem) error
	GetByID(ctx context.Context, id string) (*entities.PosItem, error)
	Update(ctx context.Context, item *entities.PosItem) error
	Delete(ctx context.Context, id string) error
}
