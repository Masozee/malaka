package persistence

import (
	"context"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/repositories"
	"malaka/internal/shared/uuid"
)

type shipmentRepository struct {
	db *sqlx.DB
}

func NewShipmentRepository(db *sqlx.DB) repositories.ShipmentRepository {
	return &shipmentRepository{db: db}
}

func (r *shipmentRepository) Create(ctx context.Context, shipment *entities.Shipment) error {
	query := `INSERT INTO shipments (id, sales_order_id, shipment_date, status, tracking_number, courier_id, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, shipment.ID, shipment.SalesOrderID, shipment.ShipmentDate, shipment.Status, shipment.TrackingNumber, shipment.CourierID, shipment.CreatedAt, shipment.UpdatedAt)
	return err
}

func (r *shipmentRepository) GetByID(ctx context.Context, id uuid.ID) (*entities.Shipment, error) {
	var shipment entities.Shipment
	query := `SELECT * FROM shipments WHERE id = $1`
	err := r.db.GetContext(ctx, &shipment, query, id)
	return &shipment, err
}

func (r *shipmentRepository) GetAll(ctx context.Context) ([]entities.Shipment, error) {
	var shipments []entities.Shipment
	query := `SELECT * FROM shipments ORDER BY created_at DESC LIMIT 500`
	err := r.db.SelectContext(ctx, &shipments, query)
	return shipments, err
}

func (r *shipmentRepository) Update(ctx context.Context, shipment *entities.Shipment) error {
	query := `UPDATE shipments SET sales_order_id = $1, shipment_date = $2, status = $3, tracking_number = $4, courier_id = $5, updated_at = $6
			  WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, shipment.SalesOrderID, shipment.ShipmentDate, shipment.Status, shipment.TrackingNumber, shipment.CourierID, shipment.UpdatedAt, shipment.ID)
	return err
}

func (r *shipmentRepository) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM shipments WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
