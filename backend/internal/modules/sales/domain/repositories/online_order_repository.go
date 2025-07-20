package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// OnlineOrderRepository defines the interface for online order data operations.
type OnlineOrderRepository interface {
	Create(ctx context.Context, order *entities.OnlineOrder) error
	GetByID(ctx context.Context, id string) (*entities.OnlineOrder, error)
	GetAll(ctx context.Context) ([]*entities.OnlineOrder, error)
	Update(ctx context.Context, order *entities.OnlineOrder) error
	Delete(ctx context.Context, id string) error
}
