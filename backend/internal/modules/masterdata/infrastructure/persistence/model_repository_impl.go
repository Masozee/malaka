package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// ModelRepositoryImpl implements repositories.ModelRepository.
type ModelRepositoryImpl struct {
	db *sqlx.DB
}

// NewModelRepositoryImpl creates a new ModelRepositoryImpl.
func NewModelRepositoryImpl(db *sqlx.DB) *ModelRepositoryImpl {
	return &ModelRepositoryImpl{db: db}
}

// Create creates a new model in the database.
func (r *ModelRepositoryImpl) Create(ctx context.Context, model *entities.Model) error {
	query := `INSERT INTO models (code, name, description, article_id, company_id, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`
	err := r.db.QueryRowContext(ctx, query, model.Code, model.Name, model.Description, model.ArticleID, model.CompanyID, model.Status, model.CreatedAt, model.UpdatedAt).Scan(&model.ID)
	return err
}

// GetByID retrieves a model by its ID from the database.
func (r *ModelRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Model, error) {
	query := `SELECT id, code, name, description, article_id, COALESCE(company_id::text, '') as company_id, status, created_at, updated_at FROM models WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	model := &entities.Model{}
	err := row.Scan(&model.ID, &model.Code, &model.Name, &model.Description, &model.ArticleID, &model.CompanyID, &model.Status, &model.CreatedAt, &model.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Model not found
	}
	return model, err
}

// Update updates an existing model in the database.
func (r *ModelRepositoryImpl) Update(ctx context.Context, model *entities.Model) error {
	query := `UPDATE models SET code = $1, name = $2, description = $3, article_id = $4, company_id = $5, status = $6, updated_at = $7 WHERE id = $8`
	_, err := r.db.ExecContext(ctx, query, model.Code, model.Name, model.Description, model.ArticleID, model.CompanyID, model.Status, model.UpdatedAt, model.ID)
	return err
}

// GetAll retrieves all models from the database.
func (r *ModelRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Model, error) {
	query := `SELECT id, code, name, description, article_id, COALESCE(company_id::text, '') as company_id, status, created_at, updated_at FROM models ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var models []*entities.Model
	for rows.Next() {
		model := &entities.Model{}
		err := rows.Scan(&model.ID, &model.Code, &model.Name, &model.Description, &model.ArticleID, &model.CompanyID, &model.Status, &model.CreatedAt, &model.UpdatedAt)
		if err != nil {
			return nil, err
		}
		models = append(models, model)
	}
	return models, rows.Err()
}

// Delete deletes a model by its ID from the database.
func (r *ModelRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM models WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
