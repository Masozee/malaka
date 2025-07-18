package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// StockBalanceRepository defines the interface for stock balance data operations.
type StockBalanceRepository interface {
	Create(ctx context.Context, sb *entities.StockBalance) error
	GetByID(ctx context.Context, id string) (*entities.StockBalance, error)
	Update(ctx context.Context, sb *entities.StockBalance) error
	Delete(ctx context.Context, id string) error
	GetByArticleAndWarehouse(ctx context.Context, articleID, warehouseID string) (*entities.StockBalance, error)
}
