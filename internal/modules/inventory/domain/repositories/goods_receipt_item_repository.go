package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// GoodsReceiptItemRepository defines the interface for goods receipt item data operations.
type GoodsReceiptItemRepository interface {
	Create(ctx context.Context, item *entities.GoodsReceiptItem) error
	GetByID(ctx context.Context, id string) (*entities.GoodsReceiptItem, error)
	Update(ctx context.Context, item *entities.GoodsReceiptItem) error
	Delete(ctx context.Context, id string) error
}
