package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// PurchaseOrderRepository defines the interface for purchase order data operations.
type PurchaseOrderRepository interface {
	Create(ctx context.Context, po *entities.PurchaseOrder) error
	GetByID(ctx context.Context, id string) (*entities.PurchaseOrder, error)
	GetAll(ctx context.Context) ([]*entities.PurchaseOrder, error)
	Update(ctx context.Context, po *entities.PurchaseOrder) error
	Delete(ctx context.Context, id string) error
}
