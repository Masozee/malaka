package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// ProsesMarginRepositoryImpl implements repositories.ProsesMarginRepository.
type ProsesMarginRepositoryImpl struct {
	db *sqlx.DB
}

// NewProsesMarginRepositoryImpl creates a new ProsesMarginRepositoryImpl.
func NewProsesMarginRepositoryImpl(db *sqlx.DB) *ProsesMarginRepositoryImpl {
	return &ProsesMarginRepositoryImpl{db: db}
}

// Create creates a new proses margin entry in the database.
func (r *ProsesMarginRepositoryImpl) Create(ctx context.Context, pm *entities.ProsesMargin) error {
	query := `INSERT INTO proses_margins (id, sales_order_id, cost_of_goods, selling_price, margin_amount, margin_percentage, calculated_at, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
	_, err := r.db.ExecContext(ctx, query, pm.ID, pm.SalesOrderID, pm.CostOfGoods, pm.SellingPrice, pm.MarginAmount, pm.MarginPercentage, pm.CalculatedAt, pm.Notes, pm.CreatedAt, pm.UpdatedAt)
	return err
}

// GetByID retrieves a proses margin entry by its ID from the database.
func (r *ProsesMarginRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.ProsesMargin, error) {
	query := `SELECT id, sales_order_id, cost_of_goods, selling_price, margin_amount, margin_percentage, calculated_at, notes, created_at, updated_at FROM proses_margins WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	pm := &entities.ProsesMargin{}
	err := row.Scan(&pm.ID, &pm.SalesOrderID, &pm.CostOfGoods, &pm.SellingPrice, &pm.MarginAmount, &pm.MarginPercentage, &pm.CalculatedAt, &pm.Notes, &pm.CreatedAt, &pm.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Proses margin entry not found
	}
	return pm, err
}

// GetAll retrieves all proses margin entries from the database.
func (r *ProsesMarginRepositoryImpl) GetAll(ctx context.Context) ([]*entities.ProsesMargin, error) {
	query := `SELECT id, sales_order_id, cost_of_goods, selling_price, margin_amount, margin_percentage, calculated_at, notes, created_at, updated_at FROM proses_margins`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pms []*entities.ProsesMargin
	for rows.Next() {
		pm := &entities.ProsesMargin{}
		if err := rows.Scan(&pm.ID, &pm.SalesOrderID, &pm.CostOfGoods, &pm.SellingPrice, &pm.MarginAmount, &pm.MarginPercentage, &pm.CalculatedAt, &pm.Notes, &pm.CreatedAt, &pm.UpdatedAt); err != nil {
			return nil, err
		}
		pms = append(pms, pm)
	}

	return pms, nil
}

// Update updates an existing proses margin entry in the database.
func (r *ProsesMarginRepositoryImpl) Update(ctx context.Context, pm *entities.ProsesMargin) error {
	query := `UPDATE proses_margins SET sales_order_id = $1, cost_of_goods = $2, selling_price = $3, margin_amount = $4, margin_percentage = $5, calculated_at = $6, notes = $7, updated_at = $8 WHERE id = $9`
	_, err := r.db.ExecContext(ctx, query, pm.SalesOrderID, pm.CostOfGoods, pm.SellingPrice, pm.MarginAmount, pm.MarginPercentage, pm.CalculatedAt, pm.Notes, pm.UpdatedAt, pm.ID)
	return err
}

// Delete deletes a proses margin entry by its ID from the database.
func (r *ProsesMarginRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM proses_margins WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
