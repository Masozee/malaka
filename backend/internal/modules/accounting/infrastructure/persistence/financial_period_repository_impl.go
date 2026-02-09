package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

// FinancialPeriodRepositoryImpl implements repositories.FinancialPeriodRepository
type FinancialPeriodRepositoryImpl struct {
	db *sql.DB
}

// NewFinancialPeriodRepository creates a new FinancialPeriodRepositoryImpl
func NewFinancialPeriodRepository(db *sql.DB) repositories.FinancialPeriodRepository {
	return &FinancialPeriodRepositoryImpl{db: db}
}

// Create inserts a new financial period into the database
func (r *FinancialPeriodRepositoryImpl) Create(ctx context.Context, period *entities.FinancialPeriod) error {
	query := `
		INSERT INTO financial_periods (id, company_id, period_name, fiscal_year, period_month,
			start_date, end_date, status, is_closed, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	period.ID = uuid.New()
	period.CreatedAt = time.Now()
	period.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		period.ID, period.CompanyID, period.PeriodName, period.FiscalYear, period.PeriodMonth,
		period.StartDate, period.EndDate, period.Status, period.IsClosed,
		period.CreatedAt, period.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create financial period: %w", err)
	}

	return nil
}

// GetByID retrieves a financial period by its ID
func (r *FinancialPeriodRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.FinancialPeriod, error) {
	query := `
		SELECT id, company_id, period_name, fiscal_year, period_month,
			start_date, end_date, status, is_closed, closed_by, closed_at,
			created_at, updated_at
		FROM financial_periods WHERE id = $1
	`

	period := &entities.FinancialPeriod{}
	var closedBy sql.NullString
	var closedAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&period.ID, &period.CompanyID, &period.PeriodName, &period.FiscalYear, &period.PeriodMonth,
		&period.StartDate, &period.EndDate, &period.Status, &period.IsClosed,
		&closedBy, &closedAt, &period.CreatedAt, &period.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("financial period not found")
		}
		return nil, fmt.Errorf("failed to get financial period: %w", err)
	}

	if closedBy.Valid {
		period.ClosedBy = closedBy.String
	}
	if closedAt.Valid {
		period.ClosedAt = &closedAt.Time
	}

	return period, nil
}

// GetAll retrieves all financial periods
func (r *FinancialPeriodRepositoryImpl) GetAll(ctx context.Context) ([]*entities.FinancialPeriod, error) {
	query := `
		SELECT id, company_id, period_name, fiscal_year, period_month,
			start_date, end_date, status, is_closed, closed_by, closed_at,
			created_at, updated_at
		FROM financial_periods ORDER BY fiscal_year DESC, period_month DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get financial periods: %w", err)
	}
	defer rows.Close()

	var periods []*entities.FinancialPeriod
	for rows.Next() {
		period := &entities.FinancialPeriod{}
		var closedBy sql.NullString
		var closedAt sql.NullTime

		err := rows.Scan(
			&period.ID, &period.CompanyID, &period.PeriodName, &period.FiscalYear, &period.PeriodMonth,
			&period.StartDate, &period.EndDate, &period.Status, &period.IsClosed,
			&closedBy, &closedAt, &period.CreatedAt, &period.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan financial period: %w", err)
		}

		if closedBy.Valid {
			period.ClosedBy = closedBy.String
		}
		if closedAt.Valid {
			period.ClosedAt = &closedAt.Time
		}

		periods = append(periods, period)
	}

	return periods, nil
}

// Update updates an existing financial period
func (r *FinancialPeriodRepositoryImpl) Update(ctx context.Context, period *entities.FinancialPeriod) error {
	query := `
		UPDATE financial_periods SET
			company_id = $2, period_name = $3, fiscal_year = $4, period_month = $5,
			start_date = $6, end_date = $7, status = $8, is_closed = $9,
			closed_by = $10, closed_at = $11, updated_at = $12
		WHERE id = $1
	`

	period.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		period.ID, period.CompanyID, period.PeriodName, period.FiscalYear, period.PeriodMonth,
		period.StartDate, period.EndDate, period.Status, period.IsClosed,
		period.ClosedBy, period.ClosedAt, period.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update financial period: %w", err)
	}

	return nil
}

// Delete removes a financial period from the database
func (r *FinancialPeriodRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM financial_periods WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete financial period: %w", err)
	}
	return nil
}

// GetByCompany retrieves financial periods by company
func (r *FinancialPeriodRepositoryImpl) GetByCompany(ctx context.Context, companyID string) ([]*entities.FinancialPeriod, error) {
	query := `
		SELECT id, company_id, period_name, fiscal_year, period_month,
			start_date, end_date, status, is_closed, closed_by, closed_at,
			created_at, updated_at
		FROM financial_periods
		WHERE company_id = $1
		ORDER BY fiscal_year DESC, period_month DESC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get financial periods by company: %w", err)
	}
	defer rows.Close()

	return r.scanPeriods(rows)
}

// GetByFiscalYear retrieves financial periods by fiscal year
func (r *FinancialPeriodRepositoryImpl) GetByFiscalYear(ctx context.Context, companyID string, fiscalYear int) ([]*entities.FinancialPeriod, error) {
	query := `
		SELECT id, company_id, period_name, fiscal_year, period_month,
			start_date, end_date, status, is_closed, closed_by, closed_at,
			created_at, updated_at
		FROM financial_periods
		WHERE company_id = $1 AND fiscal_year = $2
		ORDER BY period_month ASC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID, fiscalYear)
	if err != nil {
		return nil, fmt.Errorf("failed to get financial periods by fiscal year: %w", err)
	}
	defer rows.Close()

	return r.scanPeriods(rows)
}

// GetCurrent retrieves the current financial period
func (r *FinancialPeriodRepositoryImpl) GetCurrent(ctx context.Context, companyID string) (*entities.FinancialPeriod, error) {
	query := `
		SELECT id, company_id, period_name, fiscal_year, period_month,
			start_date, end_date, status, is_closed, closed_by, closed_at,
			created_at, updated_at
		FROM financial_periods
		WHERE company_id = $1 AND start_date <= NOW() AND end_date >= NOW()
		ORDER BY start_date DESC LIMIT 1
	`

	period := &entities.FinancialPeriod{}
	var closedBy sql.NullString
	var closedAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, companyID).Scan(
		&period.ID, &period.CompanyID, &period.PeriodName, &period.FiscalYear, &period.PeriodMonth,
		&period.StartDate, &period.EndDate, &period.Status, &period.IsClosed,
		&closedBy, &closedAt, &period.CreatedAt, &period.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no current financial period found")
		}
		return nil, fmt.Errorf("failed to get current financial period: %w", err)
	}

	if closedBy.Valid {
		period.ClosedBy = closedBy.String
	}
	if closedAt.Valid {
		period.ClosedAt = &closedAt.Time
	}

	return period, nil
}

// GetOpenPeriods retrieves all open financial periods
func (r *FinancialPeriodRepositoryImpl) GetOpenPeriods(ctx context.Context, companyID string) ([]*entities.FinancialPeriod, error) {
	query := `
		SELECT id, company_id, period_name, fiscal_year, period_month,
			start_date, end_date, status, is_closed, closed_by, closed_at,
			created_at, updated_at
		FROM financial_periods
		WHERE company_id = $1 AND is_closed = false
		ORDER BY fiscal_year DESC, period_month DESC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get open financial periods: %w", err)
	}
	defer rows.Close()

	return r.scanPeriods(rows)
}

// GetClosedPeriods retrieves all closed financial periods
func (r *FinancialPeriodRepositoryImpl) GetClosedPeriods(ctx context.Context, companyID string) ([]*entities.FinancialPeriod, error) {
	query := `
		SELECT id, company_id, period_name, fiscal_year, period_month,
			start_date, end_date, status, is_closed, closed_by, closed_at,
			created_at, updated_at
		FROM financial_periods
		WHERE company_id = $1 AND is_closed = true
		ORDER BY fiscal_year DESC, period_month DESC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get closed financial periods: %w", err)
	}
	defer rows.Close()

	return r.scanPeriods(rows)
}

// Close marks a financial period as closed
func (r *FinancialPeriodRepositoryImpl) Close(ctx context.Context, id uuid.ID, userID string) error {
	period, err := r.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if err := period.Close(userID); err != nil {
		return err
	}

	return r.Update(ctx, period)
}

// Reopen reopens a closed financial period
func (r *FinancialPeriodRepositoryImpl) Reopen(ctx context.Context, id uuid.ID) error {
	period, err := r.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if err := period.Reopen(); err != nil {
		return err
	}

	return r.Update(ctx, period)
}

// scanPeriods is a helper function to scan multiple periods
func (r *FinancialPeriodRepositoryImpl) scanPeriods(rows *sql.Rows) ([]*entities.FinancialPeriod, error) {
	var periods []*entities.FinancialPeriod
	for rows.Next() {
		period := &entities.FinancialPeriod{}
		var closedBy sql.NullString
		var closedAt sql.NullTime

		err := rows.Scan(
			&period.ID, &period.CompanyID, &period.PeriodName, &period.FiscalYear, &period.PeriodMonth,
			&period.StartDate, &period.EndDate, &period.Status, &period.IsClosed,
			&closedBy, &closedAt, &period.CreatedAt, &period.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan financial period: %w", err)
		}

		if closedBy.Valid {
			period.ClosedBy = closedBy.String
		}
		if closedAt.Valid {
			period.ClosedAt = &closedAt.Time
		}

		periods = append(periods, period)
	}

	return periods, nil
}
