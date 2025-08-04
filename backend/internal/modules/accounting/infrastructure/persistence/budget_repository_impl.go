package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

// BudgetRepositoryImpl implements repositories.BudgetRepository for PostgreSQL
type BudgetRepositoryImpl struct {
	db *sql.DB
}

// NewBudgetRepository creates a new BudgetRepositoryImpl
func NewBudgetRepository(db *sql.DB) repositories.BudgetRepository {
	return &BudgetRepositoryImpl{db: db}
}

// Create inserts a new budget into the database
func (r *BudgetRepositoryImpl) Create(ctx context.Context, budget *entities.Budget) error {
	if err := budget.Validate(); err != nil {
		return err
	}

	query := `
		INSERT INTO budgets (id, budget_code, budget_name, budget_type, status, fiscal_year, 
			period_start, period_end, total_budget, total_actual, total_variance, 
			currency_code, description, company_id, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
	`

	budget.ID = uuid.New()
	budget.CreatedAt = time.Now()
	budget.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		budget.ID, budget.BudgetCode, budget.BudgetName, budget.BudgetType,
		budget.Status, budget.FiscalYear, budget.PeriodStart, budget.PeriodEnd,
		budget.TotalBudget, budget.TotalActual, budget.TotalVariance,
		budget.CurrencyCode, budget.Description, budget.CompanyID,
		budget.CreatedBy, budget.CreatedAt, budget.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create budget: %w", err)
	}

	return nil
}

// GetByID retrieves a budget by its ID
func (r *BudgetRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.Budget, error) {
	query := `
		SELECT id, budget_code, budget_name, budget_type, status, fiscal_year,
			period_start, period_end, total_budget, total_actual, total_variance,
			currency_code, description, company_id, approved_by, approved_at,
			created_by, created_at, updated_at
		FROM budgets WHERE id = $1
	`

	budget := &entities.Budget{}
	var approvedBy sql.NullString
	var approvedAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&budget.ID, &budget.BudgetCode, &budget.BudgetName, &budget.BudgetType,
		&budget.Status, &budget.FiscalYear, &budget.PeriodStart, &budget.PeriodEnd,
		&budget.TotalBudget, &budget.TotalActual, &budget.TotalVariance,
		&budget.CurrencyCode, &budget.Description, &budget.CompanyID,
		&approvedBy, &approvedAt, &budget.CreatedBy, &budget.CreatedAt, &budget.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("budget not found")
		}
		return nil, fmt.Errorf("failed to get budget: %w", err)
	}

	if approvedBy.Valid {
		budget.ApprovedBy = approvedBy.String
	}
	if approvedAt.Valid {
		budget.ApprovedAt = &approvedAt.Time
	}

	// Load budget lines
	lines, err := r.GetLinesByBudgetID(ctx, budget.ID)
	if err != nil {
		return nil, err
	}
	budget.Lines = make([]entities.BudgetLine, len(lines))
	for i, line := range lines {
		budget.Lines[i] = *line
	}

	return budget, nil
}

// GetAll retrieves all budgets
func (r *BudgetRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Budget, error) {
	query := `
		SELECT id, budget_code, budget_name, budget_type, status, fiscal_year,
			period_start, period_end, total_budget, total_actual, total_variance,
			currency_code, description, company_id, approved_by, approved_at,
			created_by, created_at, updated_at
		FROM budgets ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get budgets: %w", err)
	}
	defer rows.Close()

	var budgets []*entities.Budget
	for rows.Next() {
		budget := &entities.Budget{}
		var approvedBy sql.NullString
		var approvedAt sql.NullTime

		err := rows.Scan(
			&budget.ID, &budget.BudgetCode, &budget.BudgetName, &budget.BudgetType,
			&budget.Status, &budget.FiscalYear, &budget.PeriodStart, &budget.PeriodEnd,
			&budget.TotalBudget, &budget.TotalActual, &budget.TotalVariance,
			&budget.CurrencyCode, &budget.Description, &budget.CompanyID,
			&approvedBy, &approvedAt, &budget.CreatedBy, &budget.CreatedAt, &budget.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget: %w", err)
		}

		if approvedBy.Valid {
			budget.ApprovedBy = approvedBy.String
		}
		if approvedAt.Valid {
			budget.ApprovedAt = &approvedAt.Time
		}

		budgets = append(budgets, budget)
	}

	return budgets, nil
}

// Update updates an existing budget
func (r *BudgetRepositoryImpl) Update(ctx context.Context, budget *entities.Budget) error {
	if err := budget.Validate(); err != nil {
		return err
	}

	query := `
		UPDATE budgets SET 
			budget_code = $2, budget_name = $3, budget_type = $4, status = $5,
			fiscal_year = $6, period_start = $7, period_end = $8, total_budget = $9,
			total_actual = $10, total_variance = $11, currency_code = $12,
			description = $13, company_id = $14, approved_by = $15, approved_at = $16,
			updated_at = $17
		WHERE id = $1
	`

	budget.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		budget.ID, budget.BudgetCode, budget.BudgetName, budget.BudgetType,
		budget.Status, budget.FiscalYear, budget.PeriodStart, budget.PeriodEnd,
		budget.TotalBudget, budget.TotalActual, budget.TotalVariance,
		budget.CurrencyCode, budget.Description, budget.CompanyID,
		budget.ApprovedBy, budget.ApprovedAt, budget.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update budget: %w", err)
	}

	return nil
}

// Delete removes a budget from the database
func (r *BudgetRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	// First delete all budget lines
	if err := r.DeleteLinesByBudgetID(ctx, id); err != nil {
		return err
	}

	query := `DELETE FROM budgets WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete budget: %w", err)
	}

	return nil
}

// CreateLine inserts a new budget line
func (r *BudgetRepositoryImpl) CreateLine(ctx context.Context, line *entities.BudgetLine) error {
	if err := line.Validate(); err != nil {
		return err
	}

	query := `
		INSERT INTO budget_lines (id, budget_id, account_id, line_number, description,
			budgeted_amount, actual_amount, variance_amount, variance_percent,
			q1_budget, q2_budget, q3_budget, q4_budget,
			q1_actual, q2_actual, q3_actual, q4_actual,
			created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
	`

	line.ID = uuid.New()
	line.CreatedAt = time.Now()
	line.UpdatedAt = time.Now()
	line.CalculateVariance()

	_, err := r.db.ExecContext(ctx, query,
		line.ID, line.BudgetID, line.AccountID, line.LineNumber, line.Description,
		line.BudgetedAmount, line.ActualAmount, line.VarianceAmount, line.VariancePercent,
		line.Q1Budget, line.Q2Budget, line.Q3Budget, line.Q4Budget,
		line.Q1Actual, line.Q2Actual, line.Q3Actual, line.Q4Actual,
		line.CreatedAt, line.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create budget line: %w", err)
	}

	return nil
}

// GetLinesByBudgetID retrieves all budget lines for a budget
func (r *BudgetRepositoryImpl) GetLinesByBudgetID(ctx context.Context, budgetID uuid.UUID) ([]*entities.BudgetLine, error) {
	query := `
		SELECT id, budget_id, account_id, line_number, description,
			budgeted_amount, actual_amount, variance_amount, variance_percent,
			q1_budget, q2_budget, q3_budget, q4_budget,
			q1_actual, q2_actual, q3_actual, q4_actual,
			created_at, updated_at
		FROM budget_lines WHERE budget_id = $1 ORDER BY line_number
	`

	rows, err := r.db.QueryContext(ctx, query, budgetID)
	if err != nil {
		return nil, fmt.Errorf("failed to get budget lines: %w", err)
	}
	defer rows.Close()

	var lines []*entities.BudgetLine
	for rows.Next() {
		line := &entities.BudgetLine{}
		err := rows.Scan(
			&line.ID, &line.BudgetID, &line.AccountID, &line.LineNumber, &line.Description,
			&line.BudgetedAmount, &line.ActualAmount, &line.VarianceAmount, &line.VariancePercent,
			&line.Q1Budget, &line.Q2Budget, &line.Q3Budget, &line.Q4Budget,
			&line.Q1Actual, &line.Q2Actual, &line.Q3Actual, &line.Q4Actual,
			&line.CreatedAt, &line.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget line: %w", err)
		}
		lines = append(lines, line)
	}

	return lines, nil
}

// UpdateLine updates an existing budget line
func (r *BudgetRepositoryImpl) UpdateLine(ctx context.Context, line *entities.BudgetLine) error {
	if err := line.Validate(); err != nil {
		return err
	}

	query := `
		UPDATE budget_lines SET 
			account_id = $2, line_number = $3, description = $4, budgeted_amount = $5,
			actual_amount = $6, variance_amount = $7, variance_percent = $8,
			q1_budget = $9, q2_budget = $10, q3_budget = $11, q4_budget = $12,
			q1_actual = $13, q2_actual = $14, q3_actual = $15, q4_actual = $16,
			updated_at = $17
		WHERE id = $1
	`

	line.UpdatedAt = time.Now()
	line.CalculateVariance()

	_, err := r.db.ExecContext(ctx, query,
		line.ID, line.AccountID, line.LineNumber, line.Description, line.BudgetedAmount,
		line.ActualAmount, line.VarianceAmount, line.VariancePercent,
		line.Q1Budget, line.Q2Budget, line.Q3Budget, line.Q4Budget,
		line.Q1Actual, line.Q2Actual, line.Q3Actual, line.Q4Actual,
		line.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update budget line: %w", err)
	}

	return nil
}

// DeleteLine removes a budget line
func (r *BudgetRepositoryImpl) DeleteLine(ctx context.Context, lineID uuid.UUID) error {
	query := `DELETE FROM budget_lines WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, lineID)
	if err != nil {
		return fmt.Errorf("failed to delete budget line: %w", err)
	}
	return nil
}

// DeleteLinesByBudgetID removes all budget lines for a budget
func (r *BudgetRepositoryImpl) DeleteLinesByBudgetID(ctx context.Context, budgetID uuid.UUID) error {
	query := `DELETE FROM budget_lines WHERE budget_id = $1`
	_, err := r.db.ExecContext(ctx, query, budgetID)
	if err != nil {
		return fmt.Errorf("failed to delete budget lines: %w", err)
	}
	return nil
}

// GetByCode retrieves a budget by its code
func (r *BudgetRepositoryImpl) GetByCode(ctx context.Context, budgetCode string) (*entities.Budget, error) {
	query := `
		SELECT id, budget_code, budget_name, budget_type, status, fiscal_year,
			period_start, period_end, total_budget, total_actual, total_variance,
			currency_code, description, company_id, approved_by, approved_at,
			created_by, created_at, updated_at
		FROM budgets WHERE budget_code = $1
	`

	budget := &entities.Budget{}
	var approvedBy sql.NullString
	var approvedAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, budgetCode).Scan(
		&budget.ID, &budget.BudgetCode, &budget.BudgetName, &budget.BudgetType,
		&budget.Status, &budget.FiscalYear, &budget.PeriodStart, &budget.PeriodEnd,
		&budget.TotalBudget, &budget.TotalActual, &budget.TotalVariance,
		&budget.CurrencyCode, &budget.Description, &budget.CompanyID,
		&approvedBy, &approvedAt, &budget.CreatedBy, &budget.CreatedAt, &budget.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("budget not found")
		}
		return nil, fmt.Errorf("failed to get budget: %w", err)
	}

	if approvedBy.Valid {
		budget.ApprovedBy = approvedBy.String
	}
	if approvedAt.Valid {
		budget.ApprovedAt = &approvedAt.Time
	}

	return budget, nil
}

// GetByType retrieves budgets by type
func (r *BudgetRepositoryImpl) GetByType(ctx context.Context, budgetType entities.BudgetType) ([]*entities.Budget, error) {
	query := `
		SELECT id, budget_code, budget_name, budget_type, status, fiscal_year,
			period_start, period_end, total_budget, total_actual, total_variance,
			currency_code, description, company_id, approved_by, approved_at,
			created_by, created_at, updated_at
		FROM budgets WHERE budget_type = $1 ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, budgetType)
	if err != nil {
		return nil, fmt.Errorf("failed to get budgets by type: %w", err)
	}
	defer rows.Close()

	var budgets []*entities.Budget
	for rows.Next() {
		budget := &entities.Budget{}
		var approvedBy sql.NullString
		var approvedAt sql.NullTime

		err := rows.Scan(
			&budget.ID, &budget.BudgetCode, &budget.BudgetName, &budget.BudgetType,
			&budget.Status, &budget.FiscalYear, &budget.PeriodStart, &budget.PeriodEnd,
			&budget.TotalBudget, &budget.TotalActual, &budget.TotalVariance,
			&budget.CurrencyCode, &budget.Description, &budget.CompanyID,
			&approvedBy, &approvedAt, &budget.CreatedBy, &budget.CreatedAt, &budget.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget: %w", err)
		}

		if approvedBy.Valid {
			budget.ApprovedBy = approvedBy.String
		}
		if approvedAt.Valid {
			budget.ApprovedAt = &approvedAt.Time
		}

		budgets = append(budgets, budget)
	}

	return budgets, nil
}

// GetByStatus retrieves budgets by status
func (r *BudgetRepositoryImpl) GetByStatus(ctx context.Context, status entities.BudgetStatus) ([]*entities.Budget, error) {
	query := `
		SELECT id, budget_code, budget_name, budget_type, status, fiscal_year,
			period_start, period_end, total_budget, total_actual, total_variance,
			currency_code, description, company_id, approved_by, approved_at,
			created_by, created_at, updated_at
		FROM budgets WHERE status = $1 ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, status)
	if err != nil {
		return nil, fmt.Errorf("failed to get budgets by status: %w", err)
	}
	defer rows.Close()

	var budgets []*entities.Budget
	for rows.Next() {
		budget := &entities.Budget{}
		var approvedBy sql.NullString
		var approvedAt sql.NullTime

		err := rows.Scan(
			&budget.ID, &budget.BudgetCode, &budget.BudgetName, &budget.BudgetType,
			&budget.Status, &budget.FiscalYear, &budget.PeriodStart, &budget.PeriodEnd,
			&budget.TotalBudget, &budget.TotalActual, &budget.TotalVariance,
			&budget.CurrencyCode, &budget.Description, &budget.CompanyID,
			&approvedBy, &approvedAt, &budget.CreatedBy, &budget.CreatedAt, &budget.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget: %w", err)
		}

		if approvedBy.Valid {
			budget.ApprovedBy = approvedBy.String
		}
		if approvedAt.Valid {
			budget.ApprovedAt = &approvedAt.Time
		}

		budgets = append(budgets, budget)
	}

	return budgets, nil
}

// GetByFiscalYear retrieves budgets by fiscal year and company
func (r *BudgetRepositoryImpl) GetByFiscalYear(ctx context.Context, companyID string, fiscalYear int) ([]*entities.Budget, error) {
	query := `
		SELECT id, budget_code, budget_name, budget_type, status, fiscal_year,
			period_start, period_end, total_budget, total_actual, total_variance,
			currency_code, description, company_id, approved_by, approved_at,
			created_by, created_at, updated_at
		FROM budgets WHERE company_id = $1 AND fiscal_year = $2 ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID, fiscalYear)
	if err != nil {
		return nil, fmt.Errorf("failed to get budgets by fiscal year: %w", err)
	}
	defer rows.Close()

	var budgets []*entities.Budget
	for rows.Next() {
		budget := &entities.Budget{}
		var approvedBy sql.NullString
		var approvedAt sql.NullTime

		err := rows.Scan(
			&budget.ID, &budget.BudgetCode, &budget.BudgetName, &budget.BudgetType,
			&budget.Status, &budget.FiscalYear, &budget.PeriodStart, &budget.PeriodEnd,
			&budget.TotalBudget, &budget.TotalActual, &budget.TotalVariance,
			&budget.CurrencyCode, &budget.Description, &budget.CompanyID,
			&approvedBy, &approvedAt, &budget.CreatedBy, &budget.CreatedAt, &budget.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget: %w", err)
		}

		if approvedBy.Valid {
			budget.ApprovedBy = approvedBy.String
		}
		if approvedAt.Valid {
			budget.ApprovedAt = &approvedAt.Time
		}

		budgets = append(budgets, budget)
	}

	return budgets, nil
}

// GetByPeriod retrieves budgets by period and company
func (r *BudgetRepositoryImpl) GetByPeriod(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.Budget, error) {
	query := `
		SELECT id, budget_code, budget_name, budget_type, status, fiscal_year,
			period_start, period_end, total_budget, total_actual, total_variance,
			currency_code, description, company_id, approved_by, approved_at,
			created_by, created_at, updated_at
		FROM budgets 
		WHERE company_id = $1 AND period_start >= $2 AND period_end <= $3 
		ORDER BY period_start ASC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get budgets by period: %w", err)
	}
	defer rows.Close()

	var budgets []*entities.Budget
	for rows.Next() {
		budget := &entities.Budget{}
		var approvedBy sql.NullString
		var approvedAt sql.NullTime

		err := rows.Scan(
			&budget.ID, &budget.BudgetCode, &budget.BudgetName, &budget.BudgetType,
			&budget.Status, &budget.FiscalYear, &budget.PeriodStart, &budget.PeriodEnd,
			&budget.TotalBudget, &budget.TotalActual, &budget.TotalVariance,
			&budget.CurrencyCode, &budget.Description, &budget.CompanyID,
			&approvedBy, &approvedAt, &budget.CreatedBy, &budget.CreatedAt, &budget.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget: %w", err)
		}

		if approvedBy.Valid {
			budget.ApprovedBy = approvedBy.String
		}
		if approvedAt.Valid {
			budget.ApprovedAt = &approvedAt.Time
		}

		budgets = append(budgets, budget)
	}

	return budgets, nil
}

// GetByCompanyID retrieves budgets by company ID
func (r *BudgetRepositoryImpl) GetByCompanyID(ctx context.Context, companyID string) ([]*entities.Budget, error) {
	query := `
		SELECT id, budget_code, budget_name, budget_type, status, fiscal_year,
			period_start, period_end, total_budget, total_actual, total_variance,
			currency_code, description, company_id, approved_by, approved_at,
			created_by, created_at, updated_at
		FROM budgets WHERE company_id = $1 ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get budgets by company: %w", err)
	}
	defer rows.Close()

	var budgets []*entities.Budget
	for rows.Next() {
		budget := &entities.Budget{}
		var approvedBy sql.NullString
		var approvedAt sql.NullTime

		err := rows.Scan(
			&budget.ID, &budget.BudgetCode, &budget.BudgetName, &budget.BudgetType,
			&budget.Status, &budget.FiscalYear, &budget.PeriodStart, &budget.PeriodEnd,
			&budget.TotalBudget, &budget.TotalActual, &budget.TotalVariance,
			&budget.CurrencyCode, &budget.Description, &budget.CompanyID,
			&approvedBy, &approvedAt, &budget.CreatedBy, &budget.CreatedAt, &budget.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget: %w", err)
		}

		if approvedBy.Valid {
			budget.ApprovedBy = approvedBy.String
		}
		if approvedAt.Valid {
			budget.ApprovedAt = &approvedAt.Time
		}

		budgets = append(budgets, budget)
	}

	return budgets, nil
}

// GetActiveByCompany retrieves active budgets by company
func (r *BudgetRepositoryImpl) GetActiveByCompany(ctx context.Context, companyID string) ([]*entities.Budget, error) {
	query := `
		SELECT id, budget_code, budget_name, budget_type, status, fiscal_year,
			period_start, period_end, total_budget, total_actual, total_variance,
			currency_code, description, company_id, approved_by, approved_at,
			created_by, created_at, updated_at
		FROM budgets 
		WHERE company_id = $1 AND status = $2 
		ORDER BY period_start ASC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID, entities.BudgetStatusActive)
	if err != nil {
		return nil, fmt.Errorf("failed to get active budgets: %w", err)
	}
	defer rows.Close()

	var budgets []*entities.Budget
	for rows.Next() {
		budget := &entities.Budget{}
		var approvedBy sql.NullString
		var approvedAt sql.NullTime

		err := rows.Scan(
			&budget.ID, &budget.BudgetCode, &budget.BudgetName, &budget.BudgetType,
			&budget.Status, &budget.FiscalYear, &budget.PeriodStart, &budget.PeriodEnd,
			&budget.TotalBudget, &budget.TotalActual, &budget.TotalVariance,
			&budget.CurrencyCode, &budget.Description, &budget.CompanyID,
			&approvedBy, &approvedAt, &budget.CreatedBy, &budget.CreatedAt, &budget.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget: %w", err)
		}

		if approvedBy.Valid {
			budget.ApprovedBy = approvedBy.String
		}
		if approvedAt.Valid {
			budget.ApprovedAt = &approvedAt.Time
		}

		budgets = append(budgets, budget)
	}

	return budgets, nil
}

// GetCurrentBudget retrieves the current active budget by type
func (r *BudgetRepositoryImpl) GetCurrentBudget(ctx context.Context, companyID string, budgetType entities.BudgetType) (*entities.Budget, error) {
	query := `
		SELECT id, budget_code, budget_name, budget_type, status, fiscal_year,
			period_start, period_end, total_budget, total_actual, total_variance,
			currency_code, description, company_id, approved_by, approved_at,
			created_by, created_at, updated_at
		FROM budgets 
		WHERE company_id = $1 AND budget_type = $2 AND status = $3 
			AND period_start <= NOW() AND period_end >= NOW()
		ORDER BY period_start DESC LIMIT 1
	`

	budget := &entities.Budget{}
	var approvedBy sql.NullString
	var approvedAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, companyID, budgetType, entities.BudgetStatusActive).Scan(
		&budget.ID, &budget.BudgetCode, &budget.BudgetName, &budget.BudgetType,
		&budget.Status, &budget.FiscalYear, &budget.PeriodStart, &budget.PeriodEnd,
		&budget.TotalBudget, &budget.TotalActual, &budget.TotalVariance,
		&budget.CurrencyCode, &budget.Description, &budget.CompanyID,
		&approvedBy, &approvedAt, &budget.CreatedBy, &budget.CreatedAt, &budget.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no current budget found")
		}
		return nil, fmt.Errorf("failed to get current budget: %w", err)
	}

	if approvedBy.Valid {
		budget.ApprovedBy = approvedBy.String
	}
	if approvedAt.Valid {
		budget.ApprovedAt = &approvedAt.Time
	}

	return budget, nil
}

// Activate activates a budget
func (r *BudgetRepositoryImpl) Activate(ctx context.Context, budgetID uuid.UUID, userID string) error {
	budget, err := r.GetByID(ctx, budgetID)
	if err != nil {
		return err
	}

	if err := budget.Activate(userID); err != nil {
		return err
	}

	return r.Update(ctx, budget)
}

// Close closes a budget
func (r *BudgetRepositoryImpl) Close(ctx context.Context, budgetID uuid.UUID) error {
	budget, err := r.GetByID(ctx, budgetID)
	if err != nil {
		return err
	}

	if err := budget.Close(); err != nil {
		return err
	}

	return r.Update(ctx, budget)
}

// Revise creates a revised version of a budget
func (r *BudgetRepositoryImpl) Revise(ctx context.Context, budgetID uuid.UUID, newBudget *entities.Budget) error {
	// Get original budget
	originalBudget, err := r.GetByID(ctx, budgetID)
	if err != nil {
		return err
	}

	// Update original budget status to revised
	originalBudget.Status = entities.BudgetStatusRevised
	originalBudget.UpdatedAt = time.Now()
	if err := r.Update(ctx, originalBudget); err != nil {
		return err
	}

	// Create new budget
	newBudget.Status = entities.BudgetStatusDraft
	return r.Create(ctx, newBudget)
}

// GetBudgetComparison retrieves budget vs actual comparison
func (r *BudgetRepositoryImpl) GetBudgetComparison(ctx context.Context, budgetID uuid.UUID, asOfDate time.Time) ([]entities.BudgetComparison, error) {
	query := `
		SELECT bl.account_id, coa.account_code, coa.account_name,
			bl.budgeted_amount, bl.actual_amount,
			bl.variance_amount, bl.variance_percent
		FROM budget_lines bl
		JOIN chart_of_accounts coa ON bl.account_id = coa.id
		WHERE bl.budget_id = $1
		ORDER BY coa.account_code
	`

	rows, err := r.db.QueryContext(ctx, query, budgetID)
	if err != nil {
		return nil, fmt.Errorf("failed to get budget comparison: %w", err)
	}
	defer rows.Close()

	var comparisons []entities.BudgetComparison
	for rows.Next() {
		comp := entities.BudgetComparison{}
		err := rows.Scan(
			&comp.AccountID, &comp.AccountCode, &comp.AccountName,
			&comp.BudgetedAmount, &comp.ActualAmount,
			&comp.VarianceAmount, &comp.VariancePercent,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget comparison: %w", err)
		}

		comp.IsFavorable = comp.VarianceAmount >= 0
		comparisons = append(comparisons, comp)
	}

	return comparisons, nil
}

// UpdateActualAmounts updates actual amounts for budget lines
func (r *BudgetRepositoryImpl) UpdateActualAmounts(ctx context.Context, budgetID uuid.UUID, periodStart, periodEnd time.Time) error {
	query := `
		UPDATE budget_lines bl
		SET actual_amount = COALESCE((
			SELECT SUM(CASE 
				WHEN gl.debit_amount > 0 THEN gl.debit_amount 
				ELSE -gl.credit_amount 
			END)
			FROM general_ledger gl
			WHERE gl.account_id = bl.account_id
				AND gl.transaction_date >= $2
				AND gl.transaction_date <= $3
		), 0),
		updated_at = NOW()
		WHERE bl.budget_id = $1
	`

	_, err := r.db.ExecContext(ctx, query, budgetID, periodStart, periodEnd)
	if err != nil {
		return fmt.Errorf("failed to update actual amounts: %w", err)
	}

	// Recalculate variances
	updateVarianceQuery := `
		UPDATE budget_lines 
		SET variance_amount = actual_amount - budgeted_amount,
			variance_percent = CASE 
				WHEN budgeted_amount != 0 THEN ((actual_amount - budgeted_amount) / budgeted_amount * 100)
				ELSE 0 
			END
		WHERE budget_id = $1
	`

	_, err = r.db.ExecContext(ctx, updateVarianceQuery, budgetID)
	if err != nil {
		return fmt.Errorf("failed to update variances: %w", err)
	}

	return nil
}

// GetBudgetVarianceReport retrieves budget variance report
func (r *BudgetRepositoryImpl) GetBudgetVarianceReport(ctx context.Context, companyID string, budgetType entities.BudgetType, asOfDate time.Time) ([]*entities.BudgetLine, error) {
	query := `
		SELECT bl.id, bl.budget_id, bl.account_id, bl.line_number, bl.description,
			bl.budgeted_amount, bl.actual_amount, bl.variance_amount, bl.variance_percent,
			bl.q1_budget, bl.q2_budget, bl.q3_budget, bl.q4_budget,
			bl.q1_actual, bl.q2_actual, bl.q3_actual, bl.q4_actual,
			bl.created_at, bl.updated_at
		FROM budget_lines bl
		JOIN budgets b ON bl.budget_id = b.id
		WHERE b.company_id = $1 AND b.budget_type = $2 AND b.status = $3
			AND b.period_start <= $4 AND b.period_end >= $4
		ORDER BY bl.line_number
	`

	rows, err := r.db.QueryContext(ctx, query, companyID, budgetType, entities.BudgetStatusActive, asOfDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get variance report: %w", err)
	}
	defer rows.Close()

	var lines []*entities.BudgetLine
	for rows.Next() {
		line := &entities.BudgetLine{}
		err := rows.Scan(
			&line.ID, &line.BudgetID, &line.AccountID, &line.LineNumber, &line.Description,
			&line.BudgetedAmount, &line.ActualAmount, &line.VarianceAmount, &line.VariancePercent,
			&line.Q1Budget, &line.Q2Budget, &line.Q3Budget, &line.Q4Budget,
			&line.Q1Actual, &line.Q2Actual, &line.Q3Actual, &line.Q4Actual,
			&line.CreatedAt, &line.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget line: %w", err)
		}
		lines = append(lines, line)
	}

	return lines, nil
}

// GetBudgetUtilization retrieves budget utilization percentage
func (r *BudgetRepositoryImpl) GetBudgetUtilization(ctx context.Context, budgetID uuid.UUID) (float64, error) {
	query := `
		SELECT 
			CASE 
				WHEN SUM(budgeted_amount) = 0 THEN 0
				ELSE (SUM(actual_amount) / SUM(budgeted_amount)) * 100
			END as utilization
		FROM budget_lines 
		WHERE budget_id = $1
	`

	var utilization float64
	err := r.db.QueryRowContext(ctx, query, budgetID).Scan(&utilization)
	if err != nil {
		return 0, fmt.Errorf("failed to get budget utilization: %w", err)
	}

	return utilization, nil
}

// GetBudgetPerformance retrieves budget performance metrics by company and fiscal year
func (r *BudgetRepositoryImpl) GetBudgetPerformance(ctx context.Context, companyID string, fiscalYear int) (map[string]float64, error) {
	query := `
		SELECT 
			SUM(total_budget) as total_budgeted,
			SUM(total_actual) as total_actual,
			SUM(total_variance) as total_variance,
			CASE 
				WHEN SUM(total_budget) = 0 THEN 0
				ELSE (SUM(total_actual) / SUM(total_budget)) * 100
			END as utilization_rate
		FROM budgets 
		WHERE company_id = $1 AND fiscal_year = $2
	`

	var totalBudgeted, totalActual, totalVariance, utilizationRate float64
	err := r.db.QueryRowContext(ctx, query, companyID, fiscalYear).Scan(
		&totalBudgeted, &totalActual, &totalVariance, &utilizationRate,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get budget performance: %w", err)
	}

	performance := map[string]float64{
		"total_budgeted":   totalBudgeted,
		"total_actual":     totalActual,
		"total_variance":   totalVariance,
		"utilization_rate": utilizationRate,
	}

	return performance, nil
}

// CreateWithLines creates a budget with its lines in a transaction
func (r *BudgetRepositoryImpl) CreateWithLines(ctx context.Context, budget *entities.Budget) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Create budget
	if err := r.Create(ctx, budget); err != nil {
		return err
	}

	// Create budget lines
	for _, line := range budget.Lines {
		line.BudgetID = budget.ID
		if err := r.CreateLine(ctx, &line); err != nil {
			return err
		}
	}

	// Calculate totals
	budget.CalculateTotals()
	if err := r.Update(ctx, budget); err != nil {
		return err
	}

	return tx.Commit()
}

// UpdateWithLines updates a budget with its lines in a transaction
func (r *BudgetRepositoryImpl) UpdateWithLines(ctx context.Context, budget *entities.Budget) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Update budget
	if err := r.Update(ctx, budget); err != nil {
		return err
	}

	// Delete existing lines
	if err := r.DeleteLinesByBudgetID(ctx, budget.ID); err != nil {
		return err
	}

	// Create new lines
	for _, line := range budget.Lines {
		line.BudgetID = budget.ID
		if err := r.CreateLine(ctx, &line); err != nil {
			return err
		}
	}

	// Calculate totals
	budget.CalculateTotals()
	if err := r.Update(ctx, budget); err != nil {
		return err
	}

	return tx.Commit()
}

// GetBudgetHistory retrieves budget history for an account
func (r *BudgetRepositoryImpl) GetBudgetHistory(ctx context.Context, companyID string, accountID uuid.UUID) ([]*entities.BudgetLine, error) {
	query := `
		SELECT bl.id, bl.budget_id, bl.account_id, bl.line_number, bl.description,
			bl.budgeted_amount, bl.actual_amount, bl.variance_amount, bl.variance_percent,
			bl.q1_budget, bl.q2_budget, bl.q3_budget, bl.q4_budget,
			bl.q1_actual, bl.q2_actual, bl.q3_actual, bl.q4_actual,
			bl.created_at, bl.updated_at
		FROM budget_lines bl
		JOIN budgets b ON bl.budget_id = b.id
		WHERE b.company_id = $1 AND bl.account_id = $2
		ORDER BY b.fiscal_year DESC, b.period_start DESC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID, accountID)
	if err != nil {
		return nil, fmt.Errorf("failed to get budget history: %w", err)
	}
	defer rows.Close()

	var lines []*entities.BudgetLine
	for rows.Next() {
		line := &entities.BudgetLine{}
		err := rows.Scan(
			&line.ID, &line.BudgetID, &line.AccountID, &line.LineNumber, &line.Description,
			&line.BudgetedAmount, &line.ActualAmount, &line.VarianceAmount, &line.VariancePercent,
			&line.Q1Budget, &line.Q2Budget, &line.Q3Budget, &line.Q4Budget,
			&line.Q1Actual, &line.Q2Actual, &line.Q3Actual, &line.Q4Actual,
			&line.CreatedAt, &line.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget line: %w", err)
		}
		lines = append(lines, line)
	}

	return lines, nil
}

// GetQuarterlyBudgets retrieves quarterly budgets for a company and fiscal year
func (r *BudgetRepositoryImpl) GetQuarterlyBudgets(ctx context.Context, companyID string, fiscalYear int) ([]*entities.Budget, error) {
	query := `
		SELECT id, budget_code, budget_name, budget_type, status, fiscal_year,
			period_start, period_end, total_budget, total_actual, total_variance,
			currency_code, description, company_id, approved_by, approved_at,
			created_by, created_at, updated_at
		FROM budgets 
		WHERE company_id = $1 AND fiscal_year = $2
		ORDER BY period_start ASC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID, fiscalYear)
	if err != nil {
		return nil, fmt.Errorf("failed to get quarterly budgets: %w", err)
	}
	defer rows.Close()

	var budgets []*entities.Budget
	for rows.Next() {
		budget := &entities.Budget{}
		var approvedBy sql.NullString
		var approvedAt sql.NullTime

		err := rows.Scan(
			&budget.ID, &budget.BudgetCode, &budget.BudgetName, &budget.BudgetType,
			&budget.Status, &budget.FiscalYear, &budget.PeriodStart, &budget.PeriodEnd,
			&budget.TotalBudget, &budget.TotalActual, &budget.TotalVariance,
			&budget.CurrencyCode, &budget.Description, &budget.CompanyID,
			&approvedBy, &approvedAt, &budget.CreatedBy, &budget.CreatedAt, &budget.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget: %w", err)
		}

		if approvedBy.Valid {
			budget.ApprovedBy = approvedBy.String
		}
		if approvedAt.Valid {
			budget.ApprovedAt = &approvedAt.Time
		}

		budgets = append(budgets, budget)
	}

	return budgets, nil
}