package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// StockControlItem represents a stock balance with article and warehouse details for stock control display.
type StockControlItem struct {
	StockBalanceID    string  `json:"stock_balance_id"`
	ArticleID         string  `json:"article_id"`
	WarehouseID       string  `json:"warehouse_id"`
	Quantity          int     `json:"quantity"`
	StockCreatedAt    string  `json:"stock_created_at"`
	StockUpdatedAt    string  `json:"stock_updated_at"`
	// Article details
	ArticleName       string  `json:"article_name"`
	ArticleCode       string  `json:"article_code"`
	ArticleDescription string `json:"article_description"`
	ArticleBarcode    string  `json:"article_barcode"`
	ArticlePrice      float64 `json:"article_price"`
	ArticleCategory   string  `json:"article_category"`
	// Warehouse details
	WarehouseName     string  `json:"warehouse_name"`
	WarehouseCode     string  `json:"warehouse_code"`
	WarehouseAddress  string  `json:"warehouse_address"`
	WarehouseCity     string  `json:"warehouse_city"`
	WarehouseType     string  `json:"warehouse_type"`
	WarehouseStatus   string  `json:"warehouse_status"`
}

// StockBalanceRepository defines the interface for stock balance data operations.
type StockBalanceRepository interface {
	Create(ctx context.Context, sb *entities.StockBalance) error
	GetByID(ctx context.Context, id string) (*entities.StockBalance, error)
	Update(ctx context.Context, sb *entities.StockBalance) error
	Delete(ctx context.Context, id string) error
	GetByArticleAndWarehouse(ctx context.Context, articleID, warehouseID string) (*entities.StockBalance, error)
	GetAll(ctx context.Context) ([]*entities.StockBalance, error)
	GetAllWithDetails(ctx context.Context) ([]*StockControlItem, error)
}
