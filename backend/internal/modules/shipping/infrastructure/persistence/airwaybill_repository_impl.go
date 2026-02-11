package persistence

import (
	"context"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/repositories"
	"malaka/internal/shared/uuid"
)

// AirwaybillRepositoryImpl implements repositories.AirwaybillRepository.
type AirwaybillRepositoryImpl struct {
	db *sqlx.DB
}

// NewAirwaybillRepositoryImpl creates a new AirwaybillRepositoryImpl.
func NewAirwaybillRepositoryImpl(db *sqlx.DB) repositories.AirwaybillRepository {
	return &AirwaybillRepositoryImpl{db: db}
}

// Create creates a new airwaybill in the database.
func (r *AirwaybillRepositoryImpl) Create(ctx context.Context, awb *entities.Airwaybill) error {
	query := `INSERT INTO airwaybills (id, shipment_id, awb_number, issue_date, origin, destination, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, awb.ID, awb.ShipmentID, awb.AWBNumber, awb.IssueDate, awb.Origin, awb.Destination, awb.CreatedAt, awb.UpdatedAt)
	return err
}

// GetByID retrieves an airwaybill by its ID from the database.
func (r *AirwaybillRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Airwaybill, error) {
	var awb entities.Airwaybill
	query := `SELECT * FROM airwaybills WHERE id = $1`
	err := r.db.GetContext(ctx, &awb, query, id)
	return &awb, err
}

// GetAll retrieves all airwaybills from the database.
func (r *AirwaybillRepositoryImpl) GetAll(ctx context.Context) ([]entities.Airwaybill, error) {
	var awbs []entities.Airwaybill
	query := `SELECT * FROM airwaybills ORDER BY created_at DESC LIMIT 500`
	err := r.db.SelectContext(ctx, &awbs, query)
	return awbs, err
}

// Update updates an existing airwaybill in the database.
func (r *AirwaybillRepositoryImpl) Update(ctx context.Context, awb *entities.Airwaybill) error {
	query := `UPDATE airwaybills SET shipment_id = $1, awb_number = $2, issue_date = $3, origin = $4, destination = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, awb.ShipmentID, awb.AWBNumber, awb.IssueDate, awb.Origin, awb.Destination, awb.UpdatedAt, awb.ID)
	return err
}

// Delete deletes an airwaybill by its ID from the database.
func (r *AirwaybillRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM airwaybills WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
