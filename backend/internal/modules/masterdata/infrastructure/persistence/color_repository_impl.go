package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
)

// ColorRepositoryImpl implements repositories.ColorRepository.
type ColorRepositoryImpl struct {
	db *sqlx.DB
}

// NewColorRepositoryImpl creates a new ColorRepositoryImpl.
func NewColorRepositoryImpl(db *sqlx.DB) *ColorRepositoryImpl {
	return &ColorRepositoryImpl{db: db}
}

// Create creates a new color in the database.
func (r *ColorRepositoryImpl) Create(ctx context.Context, color *entities.Color) error {
	query := `INSERT INTO colors (id, name, hex, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.ExecContext(ctx, query, color.ID, color.Name, color.Hex, color.CreatedAt, color.UpdatedAt)
	return err
}

// GetByID retrieves a color by its ID from the database.
func (r *ColorRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Color, error) {
	query := `SELECT id, name, hex, created_at, updated_at FROM colors WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	color := &entities.Color{}
	err := row.Scan(&color.ID, &color.Name, &color.Hex, &color.CreatedAt, &color.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Color not found
	}
	return color, err
}

// Update updates an existing color in the database.
func (r *ColorRepositoryImpl) Update(ctx context.Context, color *entities.Color) error {
	query := `UPDATE colors SET name = $1, hex = $2, updated_at = $3 WHERE id = $4`
	_, err := r.db.ExecContext(ctx, query, color.Name, color.Hex, color.UpdatedAt, color.ID)
	return err
}

// GetAll retrieves all colors from the database.
func (r *ColorRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Color, error) {
	query := `SELECT id, name, hex, created_at, updated_at FROM colors ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var colors []*entities.Color
	for rows.Next() {
		color := &entities.Color{}
		err := rows.Scan(&color.ID, &color.Name, &color.Hex, &color.CreatedAt, &color.UpdatedAt)
		if err != nil {
			return nil, err
		}
		colors = append(colors, color)
	}
	return colors, rows.Err()
}

// Delete deletes a color by its ID from the database.
func (r *ColorRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM colors WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
