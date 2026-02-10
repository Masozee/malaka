package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// StockOpnameRepositoryImpl implements repositories.StockOpnameRepository.
type StockOpnameRepositoryImpl struct {
	db *sqlx.DB
}

// NewStockOpnameRepositoryImpl creates a new StockOpnameRepositoryImpl.
func NewStockOpnameRepositoryImpl(db *sqlx.DB) *StockOpnameRepositoryImpl {
	return &StockOpnameRepositoryImpl{db: db}
}

// Create creates a new stock opname in the database.
func (r *StockOpnameRepositoryImpl) Create(ctx context.Context, so *entities.StockOpname) error {
	query := `INSERT INTO stock_opnames (id, warehouse_id, opname_date, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, so.ID, so.WarehouseID, so.OpnameDate, so.Status, so.CreatedAt, so.UpdatedAt)
	return err
}

// GetByID retrieves a stock opname by its ID from the database.
func (r *StockOpnameRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.StockOpname, error) {
	query := `SELECT id, warehouse_id, opname_date, status, created_at, updated_at FROM stock_opnames WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	so := &entities.StockOpname{}
	err := row.Scan(&so.ID, &so.WarehouseID, &so.OpnameDate, &so.Status, &so.CreatedAt, &so.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Stock opname not found
	}
	return so, err
}

// Update updates an existing stock opname in the database.
func (r *StockOpnameRepositoryImpl) Update(ctx context.Context, so *entities.StockOpname) error {
	query := `UPDATE stock_opnames SET warehouse_id = $1, opname_date = $2, status = $3, updated_at = $4 WHERE id = $5`
	_, err := r.db.ExecContext(ctx, query, so.WarehouseID, so.OpnameDate, so.Status, so.UpdatedAt, so.ID)
	return err
}

// GetAll retrieves all stock opnames from the database.
func (r *StockOpnameRepositoryImpl) GetAll(ctx context.Context) ([]*entities.StockOpname, error) {
	query := `SELECT id, warehouse_id, opname_date, status, created_at, updated_at FROM stock_opnames ORDER BY opname_date DESC, created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stockOpnames []*entities.StockOpname
	for rows.Next() {
		so := &entities.StockOpname{}
		err := rows.Scan(&so.ID, &so.WarehouseID, &so.OpnameDate, &so.Status, &so.CreatedAt, &so.UpdatedAt)
		if err != nil {
			return nil, err
		}
		stockOpnames = append(stockOpnames, so)
	}
	return stockOpnames, rows.Err()
}

// Delete deletes a stock opname by its ID from the database.
func (r *StockOpnameRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM stock_opnames WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
