package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// InvoiceRepository defines the interface for invoice data operations.
type InvoiceRepository interface {
	Create(ctx context.Context, invoice *entities.Invoice) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Invoice, error)
	GetAll(ctx context.Context) ([]*entities.Invoice, error)
	Update(ctx context.Context, invoice *entities.Invoice) error
	Delete(ctx context.Context, id uuid.ID) error
}
