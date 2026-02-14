package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/shared/uuid"
)

// PosItemRepositoryImpl implements repositories.PosItemRepository.
type PosItemRepositoryImpl struct {
	db *sqlx.DB
}

// NewPosItemRepositoryImpl creates a new PosItemRepositoryImpl.
func NewPosItemRepositoryImpl(db *sqlx.DB) *PosItemRepositoryImpl {
	return &PosItemRepositoryImpl{db: db}
}

// Create creates a new POS item in the database.
func (r *PosItemRepositoryImpl) Create(ctx context.Context, item *entities.PosItem) error {
	query := `INSERT INTO pos_items (id, pos_transaction_id, article_id, quantity, unit_price, line_total, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, item.ID, item.PosTransactionID, item.ArticleID, item.Quantity, item.UnitPrice, item.TotalPrice, item.CreatedAt, item.UpdatedAt)
	return err
}

// GetByID retrieves a POS item by its ID from the database.
func (r *PosItemRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.PosItem, error) {
	query := `SELECT id, pos_transaction_id, article_id, quantity, unit_price, line_total, created_at, updated_at FROM pos_items WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	item := &entities.PosItem{}
	err := row.Scan(&item.ID, &item.PosTransactionID, &item.ArticleID, &item.Quantity, &item.UnitPrice, &item.TotalPrice, &item.CreatedAt, &item.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // POS item not found
	}
	return item, err
}

// GetByPosTransactionID retrieves all POS items for a given transaction.
func (r *PosItemRepositoryImpl) GetByPosTransactionID(ctx context.Context, posTransactionID uuid.ID) ([]*entities.PosItem, error) {
	query := `SELECT id, pos_transaction_id, article_id, quantity, unit_price, line_total, created_at, updated_at FROM pos_items WHERE pos_transaction_id = $1 ORDER BY created_at ASC`
	rows, err := r.db.QueryContext(ctx, query, posTransactionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*entities.PosItem
	for rows.Next() {
		item := &entities.PosItem{}
		err := rows.Scan(&item.ID, &item.PosTransactionID, &item.ArticleID, &item.Quantity, &item.UnitPrice, &item.TotalPrice, &item.CreatedAt, &item.UpdatedAt)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

// Update updates an existing POS item in the database.
func (r *PosItemRepositoryImpl) Update(ctx context.Context, item *entities.PosItem) error {
	query := `UPDATE pos_items SET pos_transaction_id = $1, article_id = $2, quantity = $3, unit_price = $4, line_total = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, item.PosTransactionID, item.ArticleID, item.Quantity, item.UnitPrice, item.TotalPrice, item.UpdatedAt, item.ID)
	return err
}

// Delete deletes a POS item by its ID from the database.
func (r *PosItemRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM pos_items WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
