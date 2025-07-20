package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/shipping/domain/entities"
)

// TrackingRepositoryImpl implements repositories.TrackingRepository.
type TrackingRepositoryImpl struct {
	db *sqlx.DB
}

// NewTrackingRepositoryImpl creates a new TrackingRepositoryImpl.
func NewTrackingRepositoryImpl(db *sqlx.DB) *TrackingRepositoryImpl {
	return &TrackingRepositoryImpl{db: db}
}

// Create creates a new tracking record in the database.
func (r *TrackingRepositoryImpl) Create(ctx context.Context, tracking *entities.Tracking) error {
	query := `INSERT INTO tracking (id, shipment_id, status, location, event_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, tracking.ID, tracking.ShipmentID, tracking.Status, tracking.Location, tracking.EventDate, tracking.CreatedAt, tracking.UpdatedAt)
	return err
}

// GetByID retrieves a tracking record by its ID from the database.
func (r *TrackingRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Tracking, error) {
	query := `SELECT id, shipment_id, status, location, event_date, created_at, updated_at FROM tracking WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	tracking := &entities.Tracking{}
	err := row.Scan(&tracking.ID, &tracking.ShipmentID, &tracking.Status, &tracking.Location, &tracking.EventDate, &tracking.CreatedAt, &tracking.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Tracking record not found
	}
	return tracking, err
}

// Update updates an existing tracking record in the database.
func (r *TrackingRepositoryImpl) Update(ctx context.Context, tracking *entities.Tracking) error {
	query := `UPDATE tracking SET shipment_id = $1, status = $2, location = $3, event_date = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, tracking.ShipmentID, tracking.Status, tracking.Location, tracking.EventDate, tracking.UpdatedAt, tracking.ID)
	return err
}

// Delete deletes a tracking record by its ID from the database.
func (r *TrackingRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM tracking WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
