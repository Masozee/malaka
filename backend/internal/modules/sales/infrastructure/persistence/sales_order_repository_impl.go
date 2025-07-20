package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// SalesOrderRepositoryImpl implements repositories.SalesOrderRepository.
type SalesOrderRepositoryImpl struct {
	db *sqlx.DB
}

// NewSalesOrderRepositoryImpl creates a new SalesOrderRepositoryImpl.
func NewSalesOrderRepositoryImpl(db *sqlx.DB) *SalesOrderRepositoryImpl {
	return &SalesOrderRepositoryImpl{db: db}
}

// Create creates a new sales order in the database.
func (r *SalesOrderRepositoryImpl) Create(ctx context.Context, so *entities.SalesOrder) error {
	query := `INSERT INTO sales_orders (id, customer_id, order_date, status, total_amount, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, so.ID, so.CustomerID, so.OrderDate, so.Status, so.TotalAmount, so.CreatedAt, so.UpdatedAt)
	return err
}

// GetByID retrieves a sales order by its ID from the database.
func (r *SalesOrderRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.SalesOrder, error) {
	query := `SELECT id, customer_id, order_date, status, total_amount, created_at, updated_at FROM sales_orders WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	so := &entities.SalesOrder{}
	err := row.Scan(&so.ID, &so.CustomerID, &so.OrderDate, &so.Status, &so.TotalAmount, &so.CreatedAt, &so.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Sales order not found
	}
	return so, err
}

// Update updates an existing sales order in the database.
func (r *SalesOrderRepositoryImpl) Update(ctx context.Context, so *entities.SalesOrder) error {
	query := `UPDATE sales_orders SET customer_id = $1, order_date = $2, status = $3, total_amount = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, so.CustomerID, so.OrderDate, so.Status, so.TotalAmount, so.UpdatedAt, so.ID)
	return err
}

// Delete deletes a sales order by its ID from the database.
func (r *SalesOrderRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM sales_orders WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetAll retrieves all sales orders from the database.
func (r *SalesOrderRepositoryImpl) GetAll(ctx context.Context) ([]*entities.SalesOrder, error) {
	query := `SELECT id, customer_id, order_date, status, total_amount, created_at, updated_at FROM sales_orders`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var salesOrders []*entities.SalesOrder
	for rows.Next() {
		so := &entities.SalesOrder{}
		if err := rows.Scan(&so.ID, &so.CustomerID, &so.OrderDate, &so.Status, &so.TotalAmount, &so.CreatedAt, &so.UpdatedAt); err != nil {
			return nil, err
		}
		salesOrders = append(salesOrders, so)
	}
	return salesOrders, nil
}
