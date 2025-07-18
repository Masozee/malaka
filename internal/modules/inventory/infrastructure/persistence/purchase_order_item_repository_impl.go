package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// PurchaseOrderItemRepositoryImpl implements repositories.PurchaseOrderItemRepository.
type PurchaseOrderItemRepositoryImpl struct {
	db *sqlx.DB
}

// NewPurchaseOrderItemRepositoryImpl creates a new PurchaseOrderItemRepositoryImpl.
func NewPurchaseOrderItemRepositoryImpl(db *sqlx.DB) *PurchaseOrderItemRepositoryImpl {
	return &PurchaseOrderItemRepositoryImpl{db: db}
}

// Create creates a new purchase order item in the database.
func (r *PurchaseOrderItemRepositoryImpl) Create(ctx context.Context, item *entities.PurchaseOrderItem) error {
	query := `INSERT INTO purchase_order_items (id, purchase_order_id, article_id, quantity, unit_price, total_price, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, item.ID, item.PurchaseOrderID, item.ArticleID, item.Quantity, item.UnitPrice, item.TotalPrice, item.CreatedAt, item.UpdatedAt)
	return err
}

// GetByID retrieves a purchase order item by its ID from the database.
func (r *PurchaseOrderItemRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.PurchaseOrderItem, error) {
	query := `SELECT id, purchase_order_id, article_id, quantity, unit_price, total_price, created_at, updated_at FROM purchase_order_items WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	item := &entities.PurchaseOrderItem{}
	err := row.Scan(&item.ID, &item.PurchaseOrderID, &item.ArticleID, &item.Quantity, &item.UnitPrice, &item.TotalPrice, &item.CreatedAt, &item.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Purchase order item not found
	}
	return item, err
}

// Update updates an existing purchase order item in the database.
func (r *PurchaseOrderItemRepositoryImpl) Update(ctx context.Context, item *entities.PurchaseOrderItem) error {
	query := `UPDATE purchase_order_items SET purchase_order_id = $1, article_id = $2, quantity = $3, unit_price = $4, total_price = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, item.PurchaseOrderID, item.ArticleID, item.Quantity, item.UnitPrice, item.TotalPrice, item.UpdatedAt, item.ID)
	return err
}

// Delete deletes a purchase order item by its ID from the database.
func (r *PurchaseOrderItemRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM purchase_order_items WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
