package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
)

// ClassificationRepositoryImpl implements repositories.ClassificationRepository.
type ClassificationRepositoryImpl struct {
	db *sqlx.DB
}

// NewClassificationRepositoryImpl creates a new ClassificationRepositoryImpl.
func NewClassificationRepositoryImpl(db *sqlx.DB) *ClassificationRepositoryImpl {
	return &ClassificationRepositoryImpl{db: db}
}

// Create creates a new classification in the database.
func (r *ClassificationRepositoryImpl) Create(ctx context.Context, classification *entities.Classification) error {
	query := `INSERT INTO classifications (id, code, name, description, parent_id, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, classification.ID, classification.Code, classification.Name,
		classification.Description, classification.ParentID, classification.Status,
		classification.CreatedAt, classification.UpdatedAt)
	return err
}

// GetByID retrieves a classification by its ID from the database.
func (r *ClassificationRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Classification, error) {
	query := `SELECT id, COALESCE(code, '') as code, name, description, parent_id,
		COALESCE(status, 'active') as status, created_at, updated_at
		FROM classifications WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	classification := &entities.Classification{}
	err := row.Scan(&classification.ID, &classification.Code, &classification.Name, &classification.Description,
		&classification.ParentID, &classification.Status, &classification.CreatedAt, &classification.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Classification not found
	}
	return classification, err
}

// GetByCode retrieves a classification by its code from the database.
func (r *ClassificationRepositoryImpl) GetByCode(ctx context.Context, code string) (*entities.Classification, error) {
	query := `SELECT id, COALESCE(code, '') as code, name, description, parent_id,
		COALESCE(status, 'active') as status, created_at, updated_at
		FROM classifications WHERE code = $1`
	row := r.db.QueryRowContext(ctx, query, code)

	classification := &entities.Classification{}
	err := row.Scan(&classification.ID, &classification.Code, &classification.Name, &classification.Description,
		&classification.ParentID, &classification.Status, &classification.CreatedAt, &classification.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Classification not found
	}
	return classification, err
}

// Update updates an existing classification in the database.
func (r *ClassificationRepositoryImpl) Update(ctx context.Context, classification *entities.Classification) error {
	query := `UPDATE classifications SET code = $1, name = $2, description = $3, parent_id = $4,
		status = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, classification.Code, classification.Name, classification.Description,
		classification.ParentID, classification.Status, classification.UpdatedAt, classification.ID)
	return err
}

// GetAll retrieves all classifications from the database.
func (r *ClassificationRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Classification, error) {
	query := `SELECT id, COALESCE(code, '') as code, name, description, parent_id,
		COALESCE(status, 'active') as status, created_at, updated_at
		FROM classifications ORDER BY name ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var classifications []*entities.Classification
	for rows.Next() {
		classification := &entities.Classification{}
		err := rows.Scan(&classification.ID, &classification.Code, &classification.Name, &classification.Description,
			&classification.ParentID, &classification.Status, &classification.CreatedAt, &classification.UpdatedAt)
		if err != nil {
			return nil, err
		}
		classifications = append(classifications, classification)
	}
	return classifications, rows.Err()
}

// GetByParentID retrieves all classifications by parent ID from the database.
func (r *ClassificationRepositoryImpl) GetByParentID(ctx context.Context, parentID string) ([]*entities.Classification, error) {
	query := `SELECT id, COALESCE(code, '') as code, name, description, parent_id,
		COALESCE(status, 'active') as status, created_at, updated_at
		FROM classifications WHERE parent_id = $1 ORDER BY name ASC`
	rows, err := r.db.QueryContext(ctx, query, parentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var classifications []*entities.Classification
	for rows.Next() {
		classification := &entities.Classification{}
		err := rows.Scan(&classification.ID, &classification.Code, &classification.Name, &classification.Description,
			&classification.ParentID, &classification.Status, &classification.CreatedAt, &classification.UpdatedAt)
		if err != nil {
			return nil, err
		}
		classifications = append(classifications, classification)
	}
	return classifications, rows.Err()
}

// GetRootClassifications retrieves all root classifications (without parent) from the database.
func (r *ClassificationRepositoryImpl) GetRootClassifications(ctx context.Context) ([]*entities.Classification, error) {
	query := `SELECT id, COALESCE(code, '') as code, name, description, parent_id,
		COALESCE(status, 'active') as status, created_at, updated_at
		FROM classifications WHERE parent_id IS NULL ORDER BY name ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var classifications []*entities.Classification
	for rows.Next() {
		classification := &entities.Classification{}
		err := rows.Scan(&classification.ID, &classification.Code, &classification.Name, &classification.Description,
			&classification.ParentID, &classification.Status, &classification.CreatedAt, &classification.UpdatedAt)
		if err != nil {
			return nil, err
		}
		classifications = append(classifications, classification)
	}
	return classifications, rows.Err()
}

// Delete deletes a classification by its ID from the database.
func (r *ClassificationRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM classifications WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
