package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// StockBalanceRepositoryImpl implements repositories.StockBalanceRepository.
type StockBalanceRepositoryImpl struct {
	db *sqlx.DB
}

// NewStockBalanceRepositoryImpl creates a new StockBalanceRepositoryImpl.
func NewStockBalanceRepositoryImpl(db *sqlx.DB) *StockBalanceRepositoryImpl {
	return &StockBalanceRepositoryImpl{db: db}
}

// Create creates a new stock balance in the database.
func (r *StockBalanceRepositoryImpl) Create(ctx context.Context, sb *entities.StockBalance) error {
	query := `INSERT INTO stock_balances (id, article_id, warehouse_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, sb.ID, sb.ArticleID, sb.WarehouseID, sb.Quantity, sb.CreatedAt, sb.UpdatedAt)
	return err
}

// GetByID retrieves a stock balance by its ID from the database.
func (r *StockBalanceRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.StockBalance, error) {
	query := `SELECT id, article_id, warehouse_id, quantity, created_at, updated_at FROM stock_balances WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	sb := &entities.StockBalance{}
	err := row.Scan(&sb.ID, &sb.ArticleID, &sb.WarehouseID, &sb.Quantity, &sb.CreatedAt, &sb.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Stock balance not found
	}
	return sb, err
}

// Update updates an existing stock balance in the database.
func (r *StockBalanceRepositoryImpl) Update(ctx context.Context, sb *entities.StockBalance) error {
	query := `UPDATE stock_balances SET article_id = $1, warehouse_id = $2, quantity = $3, updated_at = $4 WHERE id = $5`
	_, err := r.db.ExecContext(ctx, query, sb.ArticleID, sb.WarehouseID, sb.Quantity, sb.UpdatedAt, sb.ID)
	return err
}

// Delete deletes a stock balance by its ID from the database.
func (r *StockBalanceRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM stock_balances WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetAll retrieves all stock balances from the database.
func (r *StockBalanceRepositoryImpl) GetAll(ctx context.Context) ([]*entities.StockBalance, error) {
	query := `SELECT id, article_id, warehouse_id, quantity, created_at, updated_at FROM stock_balances ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stockBalances []*entities.StockBalance
	for rows.Next() {
		sb := &entities.StockBalance{}
		err := rows.Scan(&sb.ID, &sb.ArticleID, &sb.WarehouseID, &sb.Quantity, &sb.CreatedAt, &sb.UpdatedAt)
		if err != nil {
			return nil, err
		}
		stockBalances = append(stockBalances, sb)
	}
	return stockBalances, rows.Err()
}

// GetByArticleAndWarehouse retrieves a stock balance by article ID and warehouse ID.
func (r *StockBalanceRepositoryImpl) GetByArticleAndWarehouse(ctx context.Context, articleID, warehouseID string) (*entities.StockBalance, error) {
	query := `SELECT id, article_id, warehouse_id, quantity, created_at, updated_at FROM stock_balances WHERE article_id = $1 AND warehouse_id = $2`
	row := r.db.QueryRowContext(ctx, query, articleID, warehouseID)

	sb := &entities.StockBalance{}
	err := row.Scan(&sb.ID, &sb.ArticleID, &sb.WarehouseID, &sb.Quantity, &sb.CreatedAt, &sb.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Stock balance not found
	}
	return sb, err
}
