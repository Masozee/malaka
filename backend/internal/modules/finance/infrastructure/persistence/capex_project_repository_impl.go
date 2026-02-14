package persistence

import (
	"context"
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// CapexProjectRepositoryImpl implements repositories.CapexProjectRepository.
type CapexProjectRepositoryImpl struct {
	db *sqlx.DB
}

// NewCapexProjectRepositoryImpl creates a new CapexProjectRepositoryImpl.
func NewCapexProjectRepositoryImpl(db *sqlx.DB) *CapexProjectRepositoryImpl {
	return &CapexProjectRepositoryImpl{db: db}
}

// Create creates a new capex project in the database.
func (r *CapexProjectRepositoryImpl) Create(ctx context.Context, cp *entities.CapexProject) error {
	if cp.ID.IsNil() {
		cp.ID = uuid.New()
	}
	var companyID interface{} = nil
	if cp.CompanyID != "" {
		companyID = cp.CompanyID
	}
	query := `INSERT INTO capex_projects (id, project_name, description, category, est_budget, actual_spent, expected_roi, status, priority, start_date, completion_date, company_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`
	_, err := r.db.ExecContext(ctx, query, cp.ID, cp.ProjectName, cp.Description, cp.Category, cp.EstBudget, cp.ActualSpent, cp.ExpectedRoi, cp.Status, cp.Priority, cp.StartDate, cp.CompletionDate, companyID, cp.CreatedAt, cp.UpdatedAt)
	return err
}

// GetByID retrieves a capex project by its ID from the database.
func (r *CapexProjectRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.CapexProject, error) {
	query := `SELECT id, project_name, COALESCE(description, '') as description, category, est_budget, actual_spent, expected_roi, status, priority, COALESCE(start_date, $2) as start_date, COALESCE(completion_date, $2) as completion_date, COALESCE(company_id::text, '') as company_id, created_at, updated_at FROM capex_projects WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id, time.Time{})

	cp := &entities.CapexProject{}
	err := row.Scan(&cp.ID, &cp.ProjectName, &cp.Description, &cp.Category, &cp.EstBudget, &cp.ActualSpent, &cp.ExpectedRoi, &cp.Status, &cp.Priority, &cp.StartDate, &cp.CompletionDate, &cp.CompanyID, &cp.CreatedAt, &cp.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Capex project not found
	}
	return cp, err
}

// GetAll retrieves all capex projects from the database.
func (r *CapexProjectRepositoryImpl) GetAll(ctx context.Context) ([]*entities.CapexProject, error) {
	var capexProjects []*entities.CapexProject
	query := `SELECT id, project_name, COALESCE(description, '') as description, category, est_budget, actual_spent, expected_roi, status, priority, COALESCE(start_date, $1) as start_date, COALESCE(completion_date, $1) as completion_date, COALESCE(company_id::text, '') as company_id, created_at, updated_at FROM capex_projects ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, time.Time{})
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		cp := &entities.CapexProject{}
		if err := rows.Scan(&cp.ID, &cp.ProjectName, &cp.Description, &cp.Category, &cp.EstBudget, &cp.ActualSpent, &cp.ExpectedRoi, &cp.Status, &cp.Priority, &cp.StartDate, &cp.CompletionDate, &cp.CompanyID, &cp.CreatedAt, &cp.UpdatedAt); err != nil {
			return nil, err
		}
		capexProjects = append(capexProjects, cp)
	}
	return capexProjects, rows.Err()
}

// Update updates an existing capex project in the database.
func (r *CapexProjectRepositoryImpl) Update(ctx context.Context, cp *entities.CapexProject) error {
	var companyID interface{} = nil
	if cp.CompanyID != "" {
		companyID = cp.CompanyID
	}
	query := `UPDATE capex_projects SET project_name = $1, description = $2, category = $3, est_budget = $4, actual_spent = $5, expected_roi = $6, status = $7, priority = $8, start_date = $9, completion_date = $10, company_id = $11, updated_at = $12 WHERE id = $13`
	_, err := r.db.ExecContext(ctx, query, cp.ProjectName, cp.Description, cp.Category, cp.EstBudget, cp.ActualSpent, cp.ExpectedRoi, cp.Status, cp.Priority, cp.StartDate, cp.CompletionDate, companyID, cp.UpdatedAt, cp.ID)
	return err
}

// Delete deletes a capex project by its ID from the database.
func (r *CapexProjectRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM capex_projects WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
