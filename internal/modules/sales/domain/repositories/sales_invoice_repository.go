package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// SalesInvoiceRepository defines the interface for sales invoice data operations.
type SalesInvoiceRepository interface {
	Create(ctx context.Context, invoice *entities.SalesInvoice) error
	GetAll(ctx context.Context) ([]*entities.SalesInvoice, error)
	GetByID(ctx context.Context, id string) (*entities.SalesInvoice, error)
	Update(ctx context.Context, invoice *entities.SalesInvoice) error
	Delete(ctx context.Context, id string) error
}
