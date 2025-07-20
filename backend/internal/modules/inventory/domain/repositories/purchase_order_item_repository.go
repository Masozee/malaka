package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// PurchaseOrderItemRepository defines the interface for purchase order item data operations.
type PurchaseOrderItemRepository interface {
	Create(ctx context.Context, item *entities.PurchaseOrderItem) error
	GetByID(ctx context.Context, id string) (*entities.PurchaseOrderItem, error)
	Update(ctx context.Context, item *entities.PurchaseOrderItem) error
	Delete(ctx context.Context, id string) error
}
