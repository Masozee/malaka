package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
)

// SizeRepositoryImpl implements repositories.SizeRepository.
type SizeRepositoryImpl struct {
	db *sqlx.DB
}

// NewSizeRepositoryImpl creates a new SizeRepositoryImpl.
func NewSizeRepositoryImpl(db *sqlx.DB) *SizeRepositoryImpl {
	return &SizeRepositoryImpl{db: db}
}

// Create creates a new size in the database.
func (r *SizeRepositoryImpl) Create(ctx context.Context, size *entities.Size) error {
	query := `INSERT INTO sizes (id, name, created_at, updated_at) VALUES ($1, $2, $3, $4)`
	_, err := r.db.ExecContext(ctx, query, size.ID, size.Name, size.CreatedAt, size.UpdatedAt)
	return err
}

// GetByID retrieves a size by its ID from the database.
func (r *SizeRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Size, error) {
	query := `SELECT id, name, created_at, updated_at FROM sizes WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	size := &entities.Size{}
	err := row.Scan(&size.ID, &size.Name, &size.CreatedAt, &size.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Size not found
	}
	return size, err
}

// Update updates an existing size in the database.
func (r *SizeRepositoryImpl) Update(ctx context.Context, size *entities.Size) error {
	query := `UPDATE sizes SET name = $1, updated_at = $2 WHERE id = $3`
	_, err := r.db.ExecContext(ctx, query, size.Name, size.UpdatedAt, size.ID)
	return err
}

// GetAll retrieves all sizes from the database.
func (r *SizeRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Size, error) {
	query := `SELECT id, name, created_at, updated_at FROM sizes ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sizes []*entities.Size
	for rows.Next() {
		size := &entities.Size{}
		err := rows.Scan(&size.ID, &size.Name, &size.CreatedAt, &size.UpdatedAt)
		if err != nil {
			return nil, err
		}
		sizes = append(sizes, size)
	}
	return sizes, rows.Err()
}

// Delete deletes a size by its ID from the database.
func (r *SizeRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM sizes WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
