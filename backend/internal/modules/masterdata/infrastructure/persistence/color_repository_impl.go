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
	query := `INSERT INTO colors (code, name, hex_code, description, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`
	err := r.db.QueryRowContext(ctx, query, color.Code, color.Name, color.HexCode, color.Description, color.Status, color.CreatedAt, color.UpdatedAt).Scan(&color.ID)
	return err
}

// GetByID retrieves a color by its ID from the database.
func (r *ColorRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Color, error) {
	query := `SELECT id, code, name, hex_code, description, status, created_at, updated_at FROM colors WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	color := &entities.Color{}
	err := row.Scan(&color.ID, &color.Code, &color.Name, &color.HexCode, &color.Description, &color.Status, &color.CreatedAt, &color.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Color not found
	}
	return color, err
}

// Update updates an existing color in the database.
func (r *ColorRepositoryImpl) Update(ctx context.Context, color *entities.Color) error {
	query := `UPDATE colors SET code = $1, name = $2, hex_code = $3, description = $4, status = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, color.Code, color.Name, color.HexCode, color.Description, color.Status, color.UpdatedAt, color.ID)
	return err
}

// GetAll retrieves all colors from the database.
func (r *ColorRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Color, error) {
	query := `SELECT id, code, name, hex_code, description, status, created_at, updated_at FROM colors ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var colors []*entities.Color
	for rows.Next() {
		color := &entities.Color{}
		err := rows.Scan(&color.ID, &color.Code, &color.Name, &color.HexCode, &color.Description, &color.Status, &color.CreatedAt, &color.UpdatedAt)
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
