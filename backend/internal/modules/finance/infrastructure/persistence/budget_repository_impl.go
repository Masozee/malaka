package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// BudgetRepositoryImpl implements repositories.BudgetRepository.
type BudgetRepositoryImpl struct {
	db *sqlx.DB
}

// NewBudgetRepositoryImpl creates a new BudgetRepositoryImpl.
func NewBudgetRepositoryImpl(db *sqlx.DB) *BudgetRepositoryImpl {
	return &BudgetRepositoryImpl{db: db}
}

// Create creates a new budget in the database.
func (r *BudgetRepositoryImpl) Create(ctx context.Context, b *entities.Budget) error {
	if b.ID.IsNil() {
		b.ID = uuid.New()
	}
	var companyID interface{} = nil
	if b.CompanyID != "" {
		companyID = b.CompanyID
	}
	query := `INSERT INTO department_budgets (id, department, category, fiscal_year, allocated, spent, status, company_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
	_, err := r.db.ExecContext(ctx, query, b.ID, b.Department, b.Category, b.FiscalYear, b.Allocated, b.Spent, b.Status, companyID, b.CreatedAt, b.UpdatedAt)
	return err
}

// GetByID retrieves a budget by its ID from the database.
func (r *BudgetRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Budget, error) {
	query := `SELECT id, department, category, fiscal_year, allocated, spent, status, COALESCE(company_id::text, '') as company_id, created_at, updated_at FROM department_budgets WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	b := &entities.Budget{}
	err := row.Scan(&b.ID, &b.Department, &b.Category, &b.FiscalYear, &b.Allocated, &b.Spent, &b.Status, &b.CompanyID, &b.CreatedAt, &b.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Budget not found
	}
	return b, err
}

// GetAll retrieves all budgets from the database.
func (r *BudgetRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Budget, error) {
	var budgets []*entities.Budget
	query := `SELECT id, department, category, fiscal_year, allocated, spent, status, COALESCE(company_id::text, '') as company_id, created_at, updated_at FROM department_budgets ORDER BY fiscal_year DESC, department ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		b := &entities.Budget{}
		if err := rows.Scan(&b.ID, &b.Department, &b.Category, &b.FiscalYear, &b.Allocated, &b.Spent, &b.Status, &b.CompanyID, &b.CreatedAt, &b.UpdatedAt); err != nil {
			return nil, err
		}
		budgets = append(budgets, b)
	}
	return budgets, rows.Err()
}

// Update updates an existing budget in the database.
func (r *BudgetRepositoryImpl) Update(ctx context.Context, b *entities.Budget) error {
	var companyID interface{} = nil
	if b.CompanyID != "" {
		companyID = b.CompanyID
	}
	query := `UPDATE department_budgets SET department = $1, category = $2, fiscal_year = $3, allocated = $4, spent = $5, status = $6, company_id = $7, updated_at = $8 WHERE id = $9`
	_, err := r.db.ExecContext(ctx, query, b.Department, b.Category, b.FiscalYear, b.Allocated, b.Spent, b.Status, companyID, b.UpdatedAt, b.ID)
	return err
}

// Delete deletes a budget by its ID from the database.
func (r *BudgetRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM department_budgets WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
