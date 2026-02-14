package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// CashReceiptRepository defines the interface for cash receipt data operations.
type CashReceiptRepository interface {
	Create(ctx context.Context, cr *entities.CashReceipt) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.CashReceipt, error)
	GetAll(ctx context.Context) ([]*entities.CashReceipt, error)
	Update(ctx context.Context, cr *entities.CashReceipt) error
	Delete(ctx context.Context, id uuid.ID) error
}
