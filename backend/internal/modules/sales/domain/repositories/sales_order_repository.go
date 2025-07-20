package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// SalesOrderRepository defines the interface for sales order data operations.
type SalesOrderRepository interface {
	Create(ctx context.Context, so *entities.SalesOrder) error
	GetAll(ctx context.Context) ([]*entities.SalesOrder, error)
	GetByID(ctx context.Context, id string) (*entities.SalesOrder, error)
	Update(ctx context.Context, so *entities.SalesOrder) error
	Delete(ctx context.Context, id string) error
}
