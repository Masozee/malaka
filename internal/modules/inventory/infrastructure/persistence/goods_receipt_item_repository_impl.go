package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// GoodsReceiptItemRepositoryImpl implements repositories.GoodsReceiptItemRepository.
type GoodsReceiptItemRepositoryImpl struct {
	db *sqlx.DB
}

// NewGoodsReceiptItemRepositoryImpl creates a new GoodsReceiptItemRepositoryImpl.
func NewGoodsReceiptItemRepositoryImpl(db *sqlx.DB) *GoodsReceiptItemRepositoryImpl {
	return &GoodsReceiptItemRepositoryImpl{db: db}
}

// Create creates a new goods receipt item in the database.
func (r *GoodsReceiptItemRepositoryImpl) Create(ctx context.Context, item *entities.GoodsReceiptItem) error {
	query := `INSERT INTO goods_receipt_items (id, goods_receipt_id, article_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, item.ID, item.GoodsReceiptID, item.ArticleID, item.Quantity, item.CreatedAt, item.UpdatedAt)
	return err
}

// GetByID retrieves a goods receipt item by its ID from the database.
func (r *GoodsReceiptItemRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.GoodsReceiptItem, error) {
	query := `SELECT id, goods_receipt_id, article_id, quantity, created_at, updated_at FROM goods_receipt_items WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	item := &entities.GoodsReceiptItem{}
	err := row.Scan(&item.ID, &item.GoodsReceiptID, &item.ArticleID, &item.Quantity, &item.CreatedAt, &item.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Goods receipt item not found
	}
	return item, err
}

// Update updates an existing goods receipt item in the database.
func (r *GoodsReceiptItemRepositoryImpl) Update(ctx context.Context, item *entities.GoodsReceiptItem) error {
	query := `UPDATE goods_receipt_items SET goods_receipt_id = $1, article_id = $2, quantity = $3, updated_at = $4 WHERE id = $5`
	_, err := r.db.ExecContext(ctx, query, item.GoodsReceiptID, item.ArticleID, item.Quantity, item.UpdatedAt, item.ID)
	return err
}

// Delete deletes a goods receipt item by its ID from the database.
func (r *GoodsReceiptItemRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM goods_receipt_items WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
