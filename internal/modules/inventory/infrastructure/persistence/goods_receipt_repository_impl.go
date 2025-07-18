package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// GoodsReceiptRepositoryImpl implements repositories.GoodsReceiptRepository.
type GoodsReceiptRepositoryImpl struct {
	db *sqlx.DB
}

// NewGoodsReceiptRepositoryImpl creates a new GoodsReceiptRepositoryImpl.
func NewGoodsReceiptRepositoryImpl(db *sqlx.DB) *GoodsReceiptRepositoryImpl {
	return &GoodsReceiptRepositoryImpl{db: db}
}

// Create creates a new goods receipt in the database.
func (r *GoodsReceiptRepositoryImpl) Create(ctx context.Context, gr *entities.GoodsReceipt) error {
	query := `INSERT INTO goods_receipts (id, purchase_order_id, receipt_date, warehouse_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, gr.ID, gr.PurchaseOrderID, gr.ReceiptDate, gr.WarehouseID, gr.CreatedAt, gr.UpdatedAt)
	return err
}

// GetByID retrieves a goods receipt by its ID from the database.
func (r *GoodsReceiptRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.GoodsReceipt, error) {
	query := `SELECT id, purchase_order_id, receipt_date, warehouse_id, created_at, updated_at FROM goods_receipts WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	gr := &entities.GoodsReceipt{}
	err := row.Scan(&gr.ID, &gr.PurchaseOrderID, &gr.ReceiptDate, &gr.WarehouseID, &gr.CreatedAt, &gr.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Goods receipt not found
	}
	return gr, err
}

// Update updates an existing goods receipt in the database.
func (r *GoodsReceiptRepositoryImpl) Update(ctx context.Context, gr *entities.GoodsReceipt) error {
	query := `UPDATE goods_receipts SET purchase_order_id = $1, receipt_date = $2, warehouse_id = $3, updated_at = $4 WHERE id = $5`
	_, err := r.db.ExecContext(ctx, query, gr.PurchaseOrderID, gr.ReceiptDate, gr.WarehouseID, gr.UpdatedAt, gr.ID)
	return err
}

// GetAll retrieves all goods receipts from the database.
func (r *GoodsReceiptRepositoryImpl) GetAll(ctx context.Context) ([]*entities.GoodsReceipt, error) {
	query := `SELECT id, purchase_order_id, receipt_date, warehouse_id, created_at, updated_at FROM goods_receipts ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var goodsReceipts []*entities.GoodsReceipt
	for rows.Next() {
		gr := &entities.GoodsReceipt{}
		err := rows.Scan(&gr.ID, &gr.PurchaseOrderID, &gr.ReceiptDate, &gr.WarehouseID, &gr.CreatedAt, &gr.UpdatedAt)
		if err != nil {
			return nil, err
		}
		goodsReceipts = append(goodsReceipts, gr)
	}
	return goodsReceipts, rows.Err()
}

// Delete deletes a goods receipt by its ID from the database.
func (r *GoodsReceiptRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM goods_receipts WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
