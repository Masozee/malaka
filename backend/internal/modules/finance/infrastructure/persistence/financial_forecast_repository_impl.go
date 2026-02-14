package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// FinancialForecastRepositoryImpl implements repositories.FinancialForecastRepository.
type FinancialForecastRepositoryImpl struct {
	db *sqlx.DB
}

// NewFinancialForecastRepositoryImpl creates a new FinancialForecastRepositoryImpl.
func NewFinancialForecastRepositoryImpl(db *sqlx.DB) *FinancialForecastRepositoryImpl {
	return &FinancialForecastRepositoryImpl{db: db}
}

// Create creates a new financial forecast in the database.
func (r *FinancialForecastRepositoryImpl) Create(ctx context.Context, ff *entities.FinancialForecast) error {
	if ff.ID.IsNil() {
		ff.ID = uuid.New()
	}
	var companyID interface{} = nil
	if ff.CompanyID != "" {
		companyID = ff.CompanyID
	}
	query := `INSERT INTO financial_forecasts (id, scenario_name, type, fiscal_year, projected_revenue, projected_ebitda, growth_rate, status, company_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	_, err := r.db.ExecContext(ctx, query, ff.ID, ff.ScenarioName, ff.Type, ff.FiscalYear, ff.ProjectedRevenue, ff.ProjectedEbitda, ff.GrowthRate, ff.Status, companyID, ff.CreatedAt, ff.UpdatedAt)
	return err
}

// GetByID retrieves a financial forecast by its ID from the database.
func (r *FinancialForecastRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.FinancialForecast, error) {
	query := `SELECT id, scenario_name, type, fiscal_year, projected_revenue, projected_ebitda, growth_rate, status, COALESCE(company_id::text, '') as company_id, created_at, updated_at FROM financial_forecasts WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	ff := &entities.FinancialForecast{}
	err := row.Scan(&ff.ID, &ff.ScenarioName, &ff.Type, &ff.FiscalYear, &ff.ProjectedRevenue, &ff.ProjectedEbitda, &ff.GrowthRate, &ff.Status, &ff.CompanyID, &ff.CreatedAt, &ff.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Financial forecast not found
	}
	return ff, err
}

// GetAll retrieves all financial forecasts from the database.
func (r *FinancialForecastRepositoryImpl) GetAll(ctx context.Context) ([]*entities.FinancialForecast, error) {
	var forecasts []*entities.FinancialForecast
	query := `SELECT id, scenario_name, type, fiscal_year, projected_revenue, projected_ebitda, growth_rate, status, COALESCE(company_id::text, '') as company_id, created_at, updated_at FROM financial_forecasts ORDER BY scenario_name ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		ff := &entities.FinancialForecast{}
		if err := rows.Scan(&ff.ID, &ff.ScenarioName, &ff.Type, &ff.FiscalYear, &ff.ProjectedRevenue, &ff.ProjectedEbitda, &ff.GrowthRate, &ff.Status, &ff.CompanyID, &ff.CreatedAt, &ff.UpdatedAt); err != nil {
			return nil, err
		}
		forecasts = append(forecasts, ff)
	}
	return forecasts, rows.Err()
}

// Update updates an existing financial forecast in the database.
func (r *FinancialForecastRepositoryImpl) Update(ctx context.Context, ff *entities.FinancialForecast) error {
	var companyID interface{} = nil
	if ff.CompanyID != "" {
		companyID = ff.CompanyID
	}
	query := `UPDATE financial_forecasts SET scenario_name = $1, type = $2, fiscal_year = $3, projected_revenue = $4, projected_ebitda = $5, growth_rate = $6, status = $7, company_id = $8, updated_at = $9 WHERE id = $10`
	_, err := r.db.ExecContext(ctx, query, ff.ScenarioName, ff.Type, ff.FiscalYear, ff.ProjectedRevenue, ff.ProjectedEbitda, ff.GrowthRate, ff.Status, companyID, ff.UpdatedAt, ff.ID)
	return err
}

// Delete deletes a financial forecast by its ID from the database.
func (r *FinancialForecastRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM financial_forecasts WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
