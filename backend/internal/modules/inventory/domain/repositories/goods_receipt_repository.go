package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// GoodsReceiptRepository defines the interface for goods receipt data operations.
type GoodsReceiptRepository interface {
	Create(ctx context.Context, gr *entities.GoodsReceipt) error
	GetByID(ctx context.Context, id string) (*entities.GoodsReceipt, error)
	GetAll(ctx context.Context) ([]*entities.GoodsReceipt, error)
	Update(ctx context.Context, gr *entities.GoodsReceipt) error
	Delete(ctx context.Context, id string) error
}
