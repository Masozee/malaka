package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// SalesInvoiceItemRepository defines the interface for sales invoice item data operations.
type SalesInvoiceItemRepository interface {
	Create(ctx context.Context, item *entities.SalesInvoiceItem) error
	GetByID(ctx context.Context, id string) (*entities.SalesInvoiceItem, error)
	Update(ctx context.Context, item *entities.SalesInvoiceItem) error
	Delete(ctx context.Context, id string) error
}
