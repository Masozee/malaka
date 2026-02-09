package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/shared/uuid"
)

// StockMovementRepositoryImpl implements repositories.StockMovementRepository.
type StockMovementRepositoryImpl struct {
	db *sqlx.DB
}

// NewStockMovementRepositoryImpl creates a new StockMovementRepositoryImpl.
func NewStockMovementRepositoryImpl(db *sqlx.DB) *StockMovementRepositoryImpl {
	return &StockMovementRepositoryImpl{db: db}
}

// Create creates a new stock movement in the database.
func (r *StockMovementRepositoryImpl) Create(ctx context.Context, sm *entities.StockMovement) error {
	query := `INSERT INTO stock_movements (id, article_id, warehouse_id, quantity, movement_type, movement_date, reference_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := r.db.ExecContext(ctx, query, sm.ID, sm.ArticleID, sm.WarehouseID, sm.Quantity, sm.MovementType, sm.MovementDate, sm.ReferenceID, sm.CreatedAt, sm.UpdatedAt)
	return err
}

// GetByID retrieves a stock movement by its ID from the database.
func (r *StockMovementRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.StockMovement, error) {
	query := `SELECT id, article_id, warehouse_id, quantity, movement_type, movement_date, reference_id, created_at, updated_at FROM stock_movements WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	sm := &entities.StockMovement{}
	err := row.Scan(&sm.ID, &sm.ArticleID, &sm.WarehouseID, &sm.Quantity, &sm.MovementType, &sm.MovementDate, &sm.ReferenceID, &sm.CreatedAt, &sm.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Stock movement not found
	}
	return sm, err
}

// Update updates an existing stock movement in the database.
func (r *StockMovementRepositoryImpl) Update(ctx context.Context, sm *entities.StockMovement) error {
	query := `UPDATE stock_movements SET article_id = $1, warehouse_id = $2, quantity = $3, movement_type = $4, movement_date = $5, reference_id = $6, updated_at = $7 WHERE id = $8`
	_, err := r.db.ExecContext(ctx, query, sm.ArticleID, sm.WarehouseID, sm.Quantity, sm.MovementType, sm.MovementDate, sm.ReferenceID, sm.UpdatedAt, sm.ID)
	return err
}

// GetAll retrieves all stock movements from the database.
func (r *StockMovementRepositoryImpl) GetAll(ctx context.Context) ([]*entities.StockMovement, error) {
	query := `SELECT id, article_id, warehouse_id, quantity, movement_type, movement_date, reference_id, created_at, updated_at FROM stock_movements ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stockMovements []*entities.StockMovement
	for rows.Next() {
		sm := &entities.StockMovement{}
		err := rows.Scan(&sm.ID, &sm.ArticleID, &sm.WarehouseID, &sm.Quantity, &sm.MovementType, &sm.MovementDate, &sm.ReferenceID, &sm.CreatedAt, &sm.UpdatedAt)
		if err != nil {
			return nil, err
		}
		stockMovements = append(stockMovements, sm)
	}
	return stockMovements, rows.Err()
}

// Delete deletes a stock movement by its ID from the database.
func (r *StockMovementRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM stock_movements WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
