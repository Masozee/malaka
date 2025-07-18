package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// SalesOrderItemRepositoryImpl implements repositories.SalesOrderItemRepository.
type SalesOrderItemRepositoryImpl struct {
	db *sqlx.DB
}

// NewSalesOrderItemRepositoryImpl creates a new SalesOrderItemRepositoryImpl.
func NewSalesOrderItemRepositoryImpl(db *sqlx.DB) *SalesOrderItemRepositoryImpl {
	return &SalesOrderItemRepositoryImpl{db: db}
}

// Create creates a new sales order item in the database.
func (r *SalesOrderItemRepositoryImpl) Create(ctx context.Context, item *entities.SalesOrderItem) error {
	query := `INSERT INTO sales_order_items (id, sales_order_id, article_id, quantity, unit_price, total_price, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, item.ID, item.SalesOrderID, item.ArticleID, item.Quantity, item.UnitPrice, item.TotalPrice, item.CreatedAt, item.UpdatedAt)
	return err
}

// GetByID retrieves a sales order item by its ID from the database.
func (r *SalesOrderItemRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.SalesOrderItem, error) {
	query := `SELECT id, sales_order_id, article_id, quantity, unit_price, total_price, created_at, updated_at FROM sales_order_items WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	item := &entities.SalesOrderItem{}
	err := row.Scan(&item.ID, &item.SalesOrderID, &item.ArticleID, &item.Quantity, &item.UnitPrice, &item.TotalPrice, &item.CreatedAt, &item.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Sales order item not found
	}
	return item, err
}

// Update updates an existing sales order item in the database.
func (r *SalesOrderItemRepositoryImpl) Update(ctx context.Context, item *entities.SalesOrderItem) error {
	query := `UPDATE sales_order_items SET sales_order_id = $1, article_id = $2, quantity = $3, unit_price = $4, total_price = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, item.SalesOrderID, item.ArticleID, item.Quantity, item.UnitPrice, item.TotalPrice, item.UpdatedAt, item.ID)
	return err
}

// Delete deletes a sales order item by its ID from the database.
func (r *SalesOrderItemRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM sales_order_items WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
