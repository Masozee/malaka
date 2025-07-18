package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// StockAdjustmentRepositoryImpl implements repositories.StockAdjustmentRepository.
type StockAdjustmentRepositoryImpl struct {
	db *sqlx.DB
}

// NewStockAdjustmentRepositoryImpl creates a new StockAdjustmentRepositoryImpl.
func NewStockAdjustmentRepositoryImpl(db *sqlx.DB) *StockAdjustmentRepositoryImpl {
	return &StockAdjustmentRepositoryImpl{db: db}
}

// Create creates a new stock adjustment in the database.
func (r *StockAdjustmentRepositoryImpl) Create(ctx context.Context, sa *entities.StockAdjustment) error {
	query := `INSERT INTO stock_adjustments (id, article_id, warehouse_id, quantity, adjustment_date, reason, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, sa.ID, sa.ArticleID, sa.WarehouseID, sa.Quantity, sa.AdjustmentDate, sa.Reason, sa.CreatedAt, sa.UpdatedAt)
	return err
}

// GetByID retrieves a stock adjustment by its ID from the database.
func (r *StockAdjustmentRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.StockAdjustment, error) {
	query := `SELECT id, article_id, warehouse_id, quantity, adjustment_date, reason, created_at, updated_at FROM stock_adjustments WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	sa := &entities.StockAdjustment{}
	err := row.Scan(&sa.ID, &sa.ArticleID, &sa.WarehouseID, &sa.Quantity, &sa.AdjustmentDate, &sa.Reason, &sa.CreatedAt, &sa.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Stock adjustment not found
	}
	return sa, err
}

// Update updates an existing stock adjustment in the database.
func (r *StockAdjustmentRepositoryImpl) Update(ctx context.Context, sa *entities.StockAdjustment) error {
	query := `UPDATE stock_adjustments SET article_id = $1, warehouse_id = $2, quantity = $3, adjustment_date = $4, reason = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, sa.ArticleID, sa.WarehouseID, sa.Quantity, sa.AdjustmentDate, sa.Reason, sa.UpdatedAt, sa.ID)
	return err
}

// GetAll retrieves all stock adjustments from the database.
func (r *StockAdjustmentRepositoryImpl) GetAll(ctx context.Context) ([]*entities.StockAdjustment, error) {
	query := `SELECT id, article_id, warehouse_id, quantity, adjustment_date, reason, created_at, updated_at FROM stock_adjustments ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stockAdjustments []*entities.StockAdjustment
	for rows.Next() {
		sa := &entities.StockAdjustment{}
		err := rows.Scan(&sa.ID, &sa.ArticleID, &sa.WarehouseID, &sa.Quantity, &sa.AdjustmentDate, &sa.Reason, &sa.CreatedAt, &sa.UpdatedAt)
		if err != nil {
			return nil, err
		}
		stockAdjustments = append(stockAdjustments, sa)
	}
	return stockAdjustments, rows.Err()
}

// Delete deletes a stock adjustment by its ID from the database.
func (r *StockAdjustmentRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM stock_adjustments WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
