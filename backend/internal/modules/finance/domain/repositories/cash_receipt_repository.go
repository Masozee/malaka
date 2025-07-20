package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
)

// CashReceiptRepository defines the interface for cash receipt data operations.
type CashReceiptRepository interface {
	Create(ctx context.Context, cr *entities.CashReceipt) error
	GetByID(ctx context.Context, id string) (*entities.CashReceipt, error)
	Update(ctx context.Context, cr *entities.CashReceipt) error
	Delete(ctx context.Context, id string) error
}
