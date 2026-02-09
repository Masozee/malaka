package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/shared/uuid"
)

// StockControlItem represents a stock balance with article and warehouse details for stock control display.
type StockControlItem struct {
	StockBalanceID     uuid.ID `json:"stock_balance_id" db:"stock_balance_id"`
	ArticleID          uuid.ID `json:"article_id" db:"article_id"`
	WarehouseID        uuid.ID `json:"warehouse_id" db:"warehouse_id"`
	Quantity           int     `json:"quantity" db:"quantity"`
	StockCreatedAt     string  `json:"stock_created_at" db:"stock_created_at"`
	StockUpdatedAt     string  `json:"stock_updated_at" db:"stock_updated_at"`
	// Article details
	ArticleName        string  `json:"article_name" db:"article_name"`
	ArticleCode        string  `json:"article_code" db:"article_code"`
	ArticleDescription string  `json:"article_description" db:"article_description"`
	ArticleBarcode     string  `json:"article_barcode" db:"article_barcode"`
	ArticlePrice       float64 `json:"article_price" db:"article_price"`
	ArticleCategory    string  `json:"article_category" db:"article_category"`
	// Warehouse details
	WarehouseName      string  `json:"warehouse_name" db:"warehouse_name"`
	WarehouseCode      string  `json:"warehouse_code" db:"warehouse_code"`
	WarehouseAddress   string  `json:"warehouse_address" db:"warehouse_address"`
	WarehouseCity      string  `json:"warehouse_city" db:"warehouse_city"`
	WarehouseType      string  `json:"warehouse_type" db:"warehouse_type"`
	WarehouseStatus    string  `json:"warehouse_status" db:"warehouse_status"`
}

// StockBalanceRepository defines the interface for stock balance data operations.
type StockBalanceRepository interface {
	Create(ctx context.Context, sb *entities.StockBalance) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.StockBalance, error)
	Update(ctx context.Context, sb *entities.StockBalance) error
	Delete(ctx context.Context, id uuid.ID) error
	GetByArticleAndWarehouse(ctx context.Context, articleID, warehouseID uuid.ID) (*entities.StockBalance, error)
	GetAll(ctx context.Context) ([]*entities.StockBalance, error)
	GetAllWithDetails(ctx context.Context) ([]*StockControlItem, error)
}
