package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

// ShipmentItemRepositoryImpl implements repositories.ShipmentItemRepository.
type ShipmentItemRepositoryImpl struct {
	db *sqlx.DB
}

// NewShipmentItemRepositoryImpl creates a new ShipmentItemRepositoryImpl.
func NewShipmentItemRepositoryImpl(db *sqlx.DB) *ShipmentItemRepositoryImpl {
	return &ShipmentItemRepositoryImpl{db: db}
}

// Create creates a new shipment item in the database.
func (r *ShipmentItemRepositoryImpl) Create(ctx context.Context, item *entities.ShipmentItem) error {
	query := `INSERT INTO shipment_items (id, shipment_id, article_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, item.ID, item.ShipmentID, item.ArticleID, item.Quantity, item.CreatedAt, item.UpdatedAt)
	return err
}

// GetByID retrieves a shipment item by its ID from the database.
func (r *ShipmentItemRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.ShipmentItem, error) {
	query := `SELECT id, shipment_id, article_id, quantity, created_at, updated_at FROM shipment_items WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	item := &entities.ShipmentItem{}
	err := row.Scan(&item.ID, &item.ShipmentID, &item.ArticleID, &item.Quantity, &item.CreatedAt, &item.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Shipment item not found
	}
	return item, err
}

// Update updates an existing shipment item in the database.
func (r *ShipmentItemRepositoryImpl) Update(ctx context.Context, item *entities.ShipmentItem) error {
	query := `UPDATE shipment_items SET shipment_id = $1, article_id = $2, quantity = $3, updated_at = $4 WHERE id = $5`
	_, err := r.db.ExecContext(ctx, query, item.ShipmentID, item.ArticleID, item.Quantity, item.UpdatedAt, item.ID)
	return err
}

// Delete deletes a shipment item by its ID from the database.
func (r *ShipmentItemRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM shipment_items WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
