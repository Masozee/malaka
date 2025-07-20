package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// DraftOrderRepository defines the interface for draft order data operations.
type DraftOrderRepository interface {
	Create(ctx context.Context, draftOrder *entities.DraftOrder) error
	GetByID(ctx context.Context, id string) (*entities.DraftOrder, error)
	Update(ctx context.Context, draftOrder *entities.DraftOrder) error
	Delete(ctx context.Context, id string) error
	GetAll(ctx context.Context) ([]*entities.DraftOrder, error)
}
