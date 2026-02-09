package persistence

import (
	"context"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/repositories"
	"malaka/internal/shared/uuid"
)

// ManifestRepositoryImpl implements repositories.ManifestRepository.
type ManifestRepositoryImpl struct {
	db *sqlx.DB
}

// NewManifestRepositoryImpl creates a new ManifestRepositoryImpl.
func NewManifestRepositoryImpl(db *sqlx.DB) repositories.ManifestRepository {
	return &ManifestRepositoryImpl{db: db}
}

// Create creates a new manifest in the database.
func (r *ManifestRepositoryImpl) Create(ctx context.Context, manifest *entities.Manifest) error {
	query := `INSERT INTO manifests (id, manifest_date, courier_id, total_shipments, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, manifest.ID, manifest.ManifestDate, manifest.CourierID, manifest.TotalShipments, manifest.CreatedAt, manifest.UpdatedAt)
	return err
}

// GetByID retrieves a manifest by its ID from the database.
func (r *ManifestRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Manifest, error) {
	var manifest entities.Manifest
	query := `SELECT * FROM manifests WHERE id = $1`
	err := r.db.GetContext(ctx, &manifest, query, id)
	return &manifest, err
}

// GetAll retrieves all manifests from the database.
func (r *ManifestRepositoryImpl) GetAll(ctx context.Context) ([]entities.Manifest, error) {
	var manifests []entities.Manifest
	query := `SELECT * FROM manifests`
	err := r.db.SelectContext(ctx, &manifests, query)
	return manifests, err
}

// Update updates an existing manifest in the database.
func (r *ManifestRepositoryImpl) Update(ctx context.Context, manifest *entities.Manifest) error {
	query := `UPDATE manifests SET manifest_date = $1, courier_id = $2, total_shipments = $3, updated_at = $4 WHERE id = $5`
	_, err := r.db.ExecContext(ctx, query, manifest.ManifestDate, manifest.CourierID, manifest.TotalShipments, manifest.UpdatedAt, manifest.ID)
	return err
}

// Delete deletes a manifest by its ID from the database.
func (r *ManifestRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM manifests WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
