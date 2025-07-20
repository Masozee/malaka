package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// OnlineOrderRepositoryImpl implements repositories.OnlineOrderRepository.
type OnlineOrderRepositoryImpl struct {
	db *sqlx.DB
}

// NewOnlineOrderRepositoryImpl creates a new OnlineOrderRepositoryImpl.
func NewOnlineOrderRepositoryImpl(db *sqlx.DB) *OnlineOrderRepositoryImpl {
	return &OnlineOrderRepositoryImpl{db: db}
}

// Create creates a new online order in the database.
func (r *OnlineOrderRepositoryImpl) Create(ctx context.Context, order *entities.OnlineOrder) error {
	query := `INSERT INTO online_orders (id, marketplace, order_id, order_date, total_amount, status, customer_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := r.db.ExecContext(ctx, query, order.ID, order.Marketplace, order.OrderID, order.OrderDate, order.TotalAmount, order.Status, order.CustomerID, order.CreatedAt, order.UpdatedAt)
	return err
}

// GetByID retrieves an online order by its ID from the database.
func (r *OnlineOrderRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.OnlineOrder, error) {
	query := `SELECT id, marketplace, order_id, order_date, total_amount, status, customer_id, created_at, updated_at FROM online_orders WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	order := &entities.OnlineOrder{}
	err := row.Scan(&order.ID, &order.Marketplace, &order.OrderID, &order.OrderDate, &order.TotalAmount, &order.Status, &order.CustomerID, &order.CreatedAt, &order.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Online order not found
	}
	return order, err
}

// GetAll retrieves all online orders from the database.
func (r *OnlineOrderRepositoryImpl) GetAll(ctx context.Context) ([]*entities.OnlineOrder, error) {
	query := `SELECT id, marketplace, order_id, order_date, total_amount, status, customer_id, created_at, updated_at FROM online_orders`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []*entities.OnlineOrder
	for rows.Next() {
		order := &entities.OnlineOrder{}
		if err := rows.Scan(&order.ID, &order.Marketplace, &order.OrderID, &order.OrderDate, &order.TotalAmount, &order.Status, &order.CustomerID, &order.CreatedAt, &order.UpdatedAt); err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}

	return orders, nil
}

// Update updates an existing online order in the database.
func (r *OnlineOrderRepositoryImpl) Update(ctx context.Context, order *entities.OnlineOrder) error {
	query := `UPDATE online_orders SET marketplace = $1, order_id = $2, order_date = $3, total_amount = $4, status = $5, customer_id = $6, updated_at = $7 WHERE id = $8`
	_, err := r.db.ExecContext(ctx, query, order.Marketplace, order.OrderID, order.OrderDate, order.TotalAmount, order.Status, order.CustomerID, order.UpdatedAt, order.ID)
	return err
}

// Delete deletes an online order by its ID from the database.
func (r *OnlineOrderRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM online_orders WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
