package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// SalesOrderItemRepository defines the interface for sales order item data operations.
type SalesOrderItemRepository interface {
	Create(ctx context.Context, item *entities.SalesOrderItem) error
	GetByID(ctx context.Context, id string) (*entities.SalesOrderItem, error)
	Update(ctx context.Context, item *entities.SalesOrderItem) error
	Delete(ctx context.Context, id string) error
}
