package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/shipping/domain/entities"
)

// CourierRepositoryImpl implements repositories.CourierRepository.
type CourierRepositoryImpl struct {
	db *sqlx.DB
}

// NewCourierRepositoryImpl creates a new CourierRepositoryImpl.
func NewCourierRepositoryImpl(db *sqlx.DB) *CourierRepositoryImpl {
	return &CourierRepositoryImpl{db: db}
}

// Create creates a new courier in the database.
func (r *CourierRepositoryImpl) Create(ctx context.Context, courier *entities.Courier) error {
	query := `INSERT INTO couriers (id, name, contact, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.ExecContext(ctx, query, courier.ID, courier.Name, courier.Contact, courier.CreatedAt, courier.UpdatedAt)
	return err
}

// GetByID retrieves a courier by its ID from the database.
func (r *CourierRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Courier, error) {
	query := `SELECT id, name, contact, created_at, updated_at FROM couriers WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	courier := &entities.Courier{}
	err := row.Scan(&courier.ID, &courier.Name, &courier.Contact, &courier.CreatedAt, &courier.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Courier not found
	}
	return courier, err
}

// GetAll retrieves all couriers from the database.
func (r *CourierRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Courier, error) {
	query := `SELECT id, name, contact, created_at, updated_at FROM couriers ORDER BY name`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var couriers []*entities.Courier
	for rows.Next() {
		courier := &entities.Courier{}
		err := rows.Scan(&courier.ID, &courier.Name, &courier.Contact, &courier.CreatedAt, &courier.UpdatedAt)
		if err != nil {
			return nil, err
		}
		couriers = append(couriers, courier)
	}

	return couriers, rows.Err()
}

// Update updates an existing courier in the database.
func (r *CourierRepositoryImpl) Update(ctx context.Context, courier *entities.Courier) error {
	query := `UPDATE couriers SET name = $1, contact = $2, updated_at = $3 WHERE id = $4`
	_, err := r.db.ExecContext(ctx, query, courier.Name, courier.Contact, courier.UpdatedAt, courier.ID)
	return err
}

// Delete deletes a courier by its ID from the database.
func (r *CourierRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM couriers WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
