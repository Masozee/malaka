package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// ConsignmentSalesRepositoryImpl implements repositories.ConsignmentSalesRepository.
type ConsignmentSalesRepositoryImpl struct {
	db *sqlx.DB
}

// NewConsignmentSalesRepositoryImpl creates a new ConsignmentSalesRepositoryImpl.
func NewConsignmentSalesRepositoryImpl(db *sqlx.DB) *ConsignmentSalesRepositoryImpl {
	return &ConsignmentSalesRepositoryImpl{db: db}
}

// Create creates new consignment sales in the database.
func (r *ConsignmentSalesRepositoryImpl) Create(ctx context.Context, cs *entities.ConsignmentSales) error {
	query := `INSERT INTO consignment_sales (id, consignee_id, sales_date, total_amount, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, cs.ID, cs.ConsigneeID, cs.SalesDate, cs.TotalAmount, cs.Status, cs.CreatedAt, cs.UpdatedAt)
	return err
}

// GetByID retrieves consignment sales by its ID from the database.
func (r *ConsignmentSalesRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.ConsignmentSales, error) {
	query := `SELECT id, consignee_id, sales_date, total_amount, status, created_at, updated_at FROM consignment_sales WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	cs := &entities.ConsignmentSales{}
	err := row.Scan(&cs.ID, &cs.ConsigneeID, &cs.SalesDate, &cs.TotalAmount, &cs.Status, &cs.CreatedAt, &cs.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Consignment sales not found
	}
	return cs, err
}

// Update updates existing consignment sales in the database.
func (r *ConsignmentSalesRepositoryImpl) Update(ctx context.Context, cs *entities.ConsignmentSales) error {
	query := `UPDATE consignment_sales SET consignee_id = $1, sales_date = $2, total_amount = $3, status = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, cs.ConsigneeID, cs.SalesDate, cs.TotalAmount, cs.Status, cs.UpdatedAt, cs.ID)
	return err
}

// Delete deletes consignment sales by its ID from the database.
func (r *ConsignmentSalesRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM consignment_sales WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
