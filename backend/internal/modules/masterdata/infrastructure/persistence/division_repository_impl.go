package persistence

import (
	"context"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
)

// DivisionRepositoryImpl implements repositories.DivisionRepository.
type DivisionRepositoryImpl struct {
	db *sqlx.DB
}

// NewDivisionRepository creates a new DivisionRepositoryImpl.
func NewDivisionRepository(db *sqlx.DB) *DivisionRepositoryImpl {
	return &DivisionRepositoryImpl{db: db}
}

// Create creates a new division in the database.
func (r *DivisionRepositoryImpl) Create(ctx context.Context, division *entities.Division) error {
	query := `INSERT INTO divisions (id, code, name, description, parent_id, level, is_active, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`
	_, err := r.db.ExecContext(ctx, query, 
		division.ID, division.Code, division.Name, division.Description, 
		division.ParentID, division.Level, division.IsActive)
	return err
}

// GetByID retrieves a division by its ID from the database.
func (r *DivisionRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.Division, error) {
	division := &entities.Division{}
	query := `SELECT id, code, name, description, parent_id, level, is_active, created_at, updated_at 
			  FROM divisions WHERE id = $1`
	err := r.db.GetContext(ctx, division, query, id)
	if err != nil {
		return nil, err
	}
	return division, nil
}

// GetAll retrieves all divisions from the database.
func (r *DivisionRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Division, error) {
	var divisions []*entities.Division
	query := `SELECT id, code, name, description, parent_id, level, is_active, created_at, updated_at 
			  FROM divisions ORDER BY level, name`
	err := r.db.SelectContext(ctx, &divisions, query)
	return divisions, err
}

// GetByCode retrieves a division by its code from the database.
func (r *DivisionRepositoryImpl) GetByCode(ctx context.Context, code string) (*entities.Division, error) {
	division := &entities.Division{}
	query := `SELECT id, code, name, description, parent_id, level, is_active, created_at, updated_at 
			  FROM divisions WHERE code = $1`
	err := r.db.GetContext(ctx, division, query, code)
	if err != nil {
		return nil, err
	}
	return division, nil
}

// GetByParentID retrieves all divisions under a parent division from the database.
func (r *DivisionRepositoryImpl) GetByParentID(ctx context.Context, parentID uuid.UUID) ([]*entities.Division, error) {
	var divisions []*entities.Division
	query := `SELECT id, code, name, description, parent_id, level, is_active, created_at, updated_at 
			  FROM divisions WHERE parent_id = $1 ORDER BY name`
	err := r.db.SelectContext(ctx, &divisions, query, parentID)
	return divisions, err
}

// GetRootDivisions retrieves all root divisions (level 1) from the database.
func (r *DivisionRepositoryImpl) GetRootDivisions(ctx context.Context) ([]*entities.Division, error) {
	var divisions []*entities.Division
	query := `SELECT id, code, name, description, parent_id, level, is_active, created_at, updated_at 
			  FROM divisions WHERE parent_id IS NULL ORDER BY name`
	err := r.db.SelectContext(ctx, &divisions, query)
	return divisions, err
}

// Update updates an existing division in the database.
func (r *DivisionRepositoryImpl) Update(ctx context.Context, division *entities.Division) error {
	query := `UPDATE divisions 
			  SET code = $1, name = $2, description = $3, parent_id = $4, level = $5, 
				  is_active = $6, updated_at = NOW() 
			  WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, 
		division.Code, division.Name, division.Description, division.ParentID, 
		division.Level, division.IsActive, division.ID)
	return err
}

// Delete deletes a division by its ID from the database.
func (r *DivisionRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM divisions WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}