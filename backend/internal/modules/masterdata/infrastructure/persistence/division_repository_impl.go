package persistence

import (
	"context"
	"fmt"

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
	query := `INSERT INTO divisions (id, code, name, description, parent_id, level, sort_order, status, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`
	_, err := r.db.ExecContext(ctx, query, 
		division.ID, division.Code, division.Name, division.Description, 
		division.ParentID, division.Level, division.SortOrder, division.Status)
	return err
}

// GetByID retrieves a division by its ID from the database.
func (r *DivisionRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.Division, error) {
	division := &entities.Division{}
	query := `SELECT id, code, name, description, parent_id, level, sort_order, status, created_at, updated_at 
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
	query := `SELECT id, code, name, description, parent_id, level, sort_order, status, created_at, updated_at 
			  FROM divisions ORDER BY level, name`
	err := r.db.SelectContext(ctx, &divisions, query)
	return divisions, err
}

// GetAllWithPagination retrieves divisions with pagination and filtering.
func (r *DivisionRepositoryImpl) GetAllWithPagination(ctx context.Context, limit, offset int, search, status, sortOrder string) ([]*entities.Division, int, error) {
	// Build WHERE clause for filtering
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	
	if search != "" {
		whereClause += " AND (code ILIKE $1 OR name ILIKE $1 OR description ILIKE $1)"
		args = append(args, "%"+search+"%")
	}
	
	if status != "" && status != "all" {
		if len(args) == 0 {
			whereClause += " AND status = $1"
		} else {
			whereClause += " AND status = $2"
		}
		args = append(args, status)
	}
	
	// Build ORDER BY clause
	orderBy := "ORDER BY level, sort_order, name"
	if sortOrder == "desc" {
		orderBy = "ORDER BY level DESC, sort_order DESC, name DESC"
	}
	
	// Get total count
	countQuery := "SELECT COUNT(*) FROM divisions " + whereClause
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	
	// Get paginated data
	limitIndex := len(args) + 1
	offsetIndex := len(args) + 2
	
	query := fmt.Sprintf(`SELECT id, code, name, description, parent_id, level, sort_order, status, created_at, updated_at 
			  FROM divisions %s 
			  %s 
			  LIMIT $%d OFFSET $%d`, whereClause, orderBy, limitIndex, offsetIndex)
	
	// Add limit and offset to args
	paginationArgs := append(args, limit, offset)
	
	var divisions []*entities.Division
	err = r.db.SelectContext(ctx, &divisions, query, paginationArgs...)
	if err != nil {
		return nil, 0, err
	}
	
	return divisions, total, nil
}

// GetByCode retrieves a division by its code from the database.
func (r *DivisionRepositoryImpl) GetByCode(ctx context.Context, code string) (*entities.Division, error) {
	division := &entities.Division{}
	query := `SELECT id, code, name, description, parent_id, level, sort_order, status, created_at, updated_at 
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
	query := `SELECT id, code, name, description, parent_id, level, sort_order, status, created_at, updated_at 
			  FROM divisions WHERE parent_id = $1 ORDER BY name`
	err := r.db.SelectContext(ctx, &divisions, query, parentID)
	return divisions, err
}

// GetRootDivisions retrieves all root divisions (level 1) from the database.
func (r *DivisionRepositoryImpl) GetRootDivisions(ctx context.Context) ([]*entities.Division, error) {
	var divisions []*entities.Division
	query := `SELECT id, code, name, description, parent_id, level, sort_order, status, created_at, updated_at 
			  FROM divisions WHERE parent_id IS NULL ORDER BY name`
	err := r.db.SelectContext(ctx, &divisions, query)
	return divisions, err
}

// Update updates an existing division in the database.
func (r *DivisionRepositoryImpl) Update(ctx context.Context, division *entities.Division) error {
	query := `UPDATE divisions 
			  SET code = $1, name = $2, description = $3, parent_id = $4, level = $5, 
				  sort_order = $6, status = $7, updated_at = NOW() 
			  WHERE id = $8`
	_, err := r.db.ExecContext(ctx, query, 
		division.Code, division.Name, division.Description, division.ParentID, 
		division.Level, division.SortOrder, division.Status, division.ID)
	return err
}

// Delete deletes a division by its ID from the database.
func (r *DivisionRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM divisions WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}