package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
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
	query := `INSERT INTO sizes (id, code, name, description, size_category, sort_order, company_id, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
	_, err := r.db.ExecContext(ctx, query, size.ID, size.Code, size.Name, size.Description,
		size.SizeCategory, size.SortOrder, size.CompanyID, size.Status, size.CreatedAt, size.UpdatedAt)
	return err
}

// GetByID retrieves a size by its ID from the database.
func (r *SizeRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Size, error) {
	query := `SELECT id, COALESCE(code, '') as code, name, description,
		COALESCE(size_category, 'shoe') as size_category, COALESCE(sort_order, 0) as sort_order,
		COALESCE(company_id::text, '') as company_id, COALESCE(status, 'active') as status, created_at, updated_at
		FROM sizes WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	size := &entities.Size{}
	err := row.Scan(&size.ID, &size.Code, &size.Name, &size.Description,
		&size.SizeCategory, &size.SortOrder, &size.CompanyID, &size.Status, &size.CreatedAt, &size.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Size not found
	}
	return size, err
}

// GetByCode retrieves a size by its code from the database.
func (r *SizeRepositoryImpl) GetByCode(ctx context.Context, code string) (*entities.Size, error) {
	query := `SELECT id, COALESCE(code, '') as code, name, description,
		COALESCE(size_category, 'shoe') as size_category, COALESCE(sort_order, 0) as sort_order,
		COALESCE(company_id::text, '') as company_id, COALESCE(status, 'active') as status, created_at, updated_at
		FROM sizes WHERE code = $1`
	row := r.db.QueryRowContext(ctx, query, code)

	size := &entities.Size{}
	err := row.Scan(&size.ID, &size.Code, &size.Name, &size.Description,
		&size.SizeCategory, &size.SortOrder, &size.CompanyID, &size.Status, &size.CreatedAt, &size.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Size not found
	}
	return size, err
}

// Update updates an existing size in the database.
func (r *SizeRepositoryImpl) Update(ctx context.Context, size *entities.Size) error {
	query := `UPDATE sizes SET code = $1, name = $2, description = $3, size_category = $4,
		sort_order = $5, company_id = $6, status = $7, updated_at = $8 WHERE id = $9`
	_, err := r.db.ExecContext(ctx, query, size.Code, size.Name, size.Description,
		size.SizeCategory, size.SortOrder, size.CompanyID, size.Status, size.UpdatedAt, size.ID)
	return err
}

// GetAll retrieves all sizes from the database.
func (r *SizeRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Size, error) {
	query := `SELECT id, COALESCE(code, '') as code, name, description,
		COALESCE(size_category, 'shoe') as size_category, COALESCE(sort_order, 0) as sort_order,
		COALESCE(company_id::text, '') as company_id, COALESCE(status, 'active') as status, created_at, updated_at
		FROM sizes ORDER BY sort_order ASC, created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sizes []*entities.Size
	for rows.Next() {
		size := &entities.Size{}
		err := rows.Scan(&size.ID, &size.Code, &size.Name, &size.Description,
			&size.SizeCategory, &size.SortOrder, &size.CompanyID, &size.Status, &size.CreatedAt, &size.UpdatedAt)
		if err != nil {
			return nil, err
		}
		sizes = append(sizes, size)
	}
	return sizes, rows.Err()
}

// GetByCategory retrieves all sizes by category from the database.
func (r *SizeRepositoryImpl) GetByCategory(ctx context.Context, category string) ([]*entities.Size, error) {
	query := `SELECT id, COALESCE(code, '') as code, name, description,
		COALESCE(size_category, 'shoe') as size_category, COALESCE(sort_order, 0) as sort_order,
		COALESCE(company_id::text, '') as company_id, COALESCE(status, 'active') as status, created_at, updated_at
		FROM sizes WHERE size_category = $1 ORDER BY sort_order ASC, created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, category)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sizes []*entities.Size
	for rows.Next() {
		size := &entities.Size{}
		err := rows.Scan(&size.ID, &size.Code, &size.Name, &size.Description,
			&size.SizeCategory, &size.SortOrder, &size.CompanyID, &size.Status, &size.CreatedAt, &size.UpdatedAt)
		if err != nil {
			return nil, err
		}
		sizes = append(sizes, size)
	}
	return sizes, rows.Err()
}

// Delete deletes a size by its ID from the database.
func (r *SizeRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM sizes WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
