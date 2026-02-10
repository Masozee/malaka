package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// TransferItemRepositoryImpl implements repositories.TransferItemRepository.
type TransferItemRepositoryImpl struct {
	db *sqlx.DB
}

// NewTransferItemRepositoryImpl creates a new TransferItemRepositoryImpl.
func NewTransferItemRepositoryImpl(db *sqlx.DB) *TransferItemRepositoryImpl {
	return &TransferItemRepositoryImpl{db: db}
}

// Create creates a new transfer item in the database.
func (r *TransferItemRepositoryImpl) Create(ctx context.Context, item *entities.TransferItem) error {
	query := `INSERT INTO transfer_items (id, transfer_order_id, article_id, quantity, received_quantity, has_discrepancy, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, item.ID, item.TransferOrderID, item.ArticleID, item.Quantity, item.ReceivedQuantity, item.HasDiscrepancy, item.CreatedAt, item.UpdatedAt)
	return err
}

// GetByID retrieves a transfer item by its ID from the database.
func (r *TransferItemRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.TransferItem, error) {
	query := `SELECT id, transfer_order_id, article_id, quantity, received_quantity, has_discrepancy, created_at, updated_at FROM transfer_items WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	item := &entities.TransferItem{}
	err := row.Scan(&item.ID, &item.TransferOrderID, &item.ArticleID, &item.Quantity, &item.ReceivedQuantity, &item.HasDiscrepancy, &item.CreatedAt, &item.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return item, err
}

// GetByTransferOrderID retrieves all transfer items for a given transfer order.
func (r *TransferItemRepositoryImpl) GetByTransferOrderID(ctx context.Context, transferOrderID string) ([]*entities.TransferItem, error) {
	query := `SELECT id, transfer_order_id, article_id, quantity, received_quantity, has_discrepancy, created_at, updated_at FROM transfer_items WHERE transfer_order_id = $1 ORDER BY created_at ASC`
	rows, err := r.db.QueryContext(ctx, query, transferOrderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*entities.TransferItem
	for rows.Next() {
		item := &entities.TransferItem{}
		err := rows.Scan(&item.ID, &item.TransferOrderID, &item.ArticleID, &item.Quantity, &item.ReceivedQuantity, &item.HasDiscrepancy, &item.CreatedAt, &item.UpdatedAt)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

// Update updates an existing transfer item in the database.
func (r *TransferItemRepositoryImpl) Update(ctx context.Context, item *entities.TransferItem) error {
	query := `UPDATE transfer_items SET transfer_order_id = $1, article_id = $2, quantity = $3, received_quantity = $4, has_discrepancy = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, item.TransferOrderID, item.ArticleID, item.Quantity, item.ReceivedQuantity, item.HasDiscrepancy, item.UpdatedAt, item.ID)
	return err
}

// Delete deletes a transfer item by its ID from the database.
func (r *TransferItemRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM transfer_items WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
