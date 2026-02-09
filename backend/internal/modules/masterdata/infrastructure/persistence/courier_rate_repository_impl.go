package persistence

import (
	"context"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)


type courierRateRepositoryImpl struct {
	db *sqlx.DB
}

func NewCourierRateRepository(db *sqlx.DB) *courierRateRepositoryImpl {
	return &courierRateRepositoryImpl{db: db}
}

func (r *courierRateRepositoryImpl) Create(ctx context.Context, courierRate *entities.CourierRate) error {
	query := `INSERT INTO courier_rates (courier_id, origin, destination, company_id, price) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.ExecContext(ctx, query, courierRate.CourierID, courierRate.Origin, courierRate.Destination, courierRate.CompanyID, courierRate.Price)
	return err
}

func (r *courierRateRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.CourierRate, error) {
	courierRate := &entities.CourierRate{}
	query := `SELECT id, courier_id, origin, destination, COALESCE(company_id::text, '') as company_id, price, created_at, updated_at FROM courier_rates WHERE id = $1`
	err := r.db.GetContext(ctx, courierRate, query, id)
	return courierRate, err
}

func (r *courierRateRepositoryImpl) Update(ctx context.Context, courierRate *entities.CourierRate) error {
	query := `UPDATE courier_rates SET courier_id = $1, origin = $2, destination = $3, company_id = $4, price = $5, updated_at = now() WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, courierRate.CourierID, courierRate.Origin, courierRate.Destination, courierRate.CompanyID, courierRate.Price, courierRate.ID)
	return err
}

func (r *courierRateRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM courier_rates WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
