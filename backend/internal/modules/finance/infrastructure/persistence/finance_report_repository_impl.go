package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// FinanceReportRepositoryImpl implements repositories.FinanceReportRepository.
type FinanceReportRepositoryImpl struct {
	db *sqlx.DB
}

// NewFinanceReportRepositoryImpl creates a new FinanceReportRepositoryImpl.
func NewFinanceReportRepositoryImpl(db *sqlx.DB) *FinanceReportRepositoryImpl {
	return &FinanceReportRepositoryImpl{db: db}
}

// Create creates a new finance report in the database.
func (r *FinanceReportRepositoryImpl) Create(ctx context.Context, fr *entities.FinanceReport) error {
	if fr.ID.IsNil() {
		fr.ID = uuid.New()
	}
	var companyID interface{} = nil
	if fr.CompanyID != "" {
		companyID = fr.CompanyID
	}
	query := `INSERT INTO finance_reports (id, report_name, type, period, generated_by, file_size, file_path, status, company_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	_, err := r.db.ExecContext(ctx, query, fr.ID, fr.ReportName, fr.Type, fr.Period, fr.GeneratedBy, fr.FileSize, fr.FilePath, fr.Status, companyID, fr.CreatedAt, fr.UpdatedAt)
	return err
}

// GetByID retrieves a finance report by its ID from the database.
func (r *FinanceReportRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.FinanceReport, error) {
	query := `SELECT id, report_name, type, period, COALESCE(generated_by, '') as generated_by, COALESCE(file_size, '') as file_size, COALESCE(file_path, '') as file_path, status, COALESCE(company_id::text, '') as company_id, created_at, updated_at FROM finance_reports WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	fr := &entities.FinanceReport{}
	err := row.Scan(&fr.ID, &fr.ReportName, &fr.Type, &fr.Period, &fr.GeneratedBy, &fr.FileSize, &fr.FilePath, &fr.Status, &fr.CompanyID, &fr.CreatedAt, &fr.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Finance report not found
	}
	return fr, err
}

// GetAll retrieves all finance reports from the database.
func (r *FinanceReportRepositoryImpl) GetAll(ctx context.Context) ([]*entities.FinanceReport, error) {
	var reports []*entities.FinanceReport
	query := `SELECT id, report_name, type, period, COALESCE(generated_by, '') as generated_by, COALESCE(file_size, '') as file_size, COALESCE(file_path, '') as file_path, status, COALESCE(company_id::text, '') as company_id, created_at, updated_at FROM finance_reports ORDER BY report_name ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		fr := &entities.FinanceReport{}
		if err := rows.Scan(&fr.ID, &fr.ReportName, &fr.Type, &fr.Period, &fr.GeneratedBy, &fr.FileSize, &fr.FilePath, &fr.Status, &fr.CompanyID, &fr.CreatedAt, &fr.UpdatedAt); err != nil {
			return nil, err
		}
		reports = append(reports, fr)
	}
	return reports, rows.Err()
}

// Update updates an existing finance report in the database.
func (r *FinanceReportRepositoryImpl) Update(ctx context.Context, fr *entities.FinanceReport) error {
	var companyID interface{} = nil
	if fr.CompanyID != "" {
		companyID = fr.CompanyID
	}
	query := `UPDATE finance_reports SET report_name = $1, type = $2, period = $3, generated_by = $4, file_size = $5, file_path = $6, status = $7, company_id = $8, updated_at = $9 WHERE id = $10`
	_, err := r.db.ExecContext(ctx, query, fr.ReportName, fr.Type, fr.Period, fr.GeneratedBy, fr.FileSize, fr.FilePath, fr.Status, companyID, fr.UpdatedAt, fr.ID)
	return err
}

// Delete deletes a finance report by its ID from the database.
func (r *FinanceReportRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM finance_reports WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
