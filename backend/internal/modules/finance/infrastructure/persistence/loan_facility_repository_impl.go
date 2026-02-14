package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// LoanFacilityRepositoryImpl implements repositories.LoanFacilityRepository.
type LoanFacilityRepositoryImpl struct {
	db *sqlx.DB
}

// NewLoanFacilityRepositoryImpl creates a new LoanFacilityRepositoryImpl.
func NewLoanFacilityRepositoryImpl(db *sqlx.DB) *LoanFacilityRepositoryImpl {
	return &LoanFacilityRepositoryImpl{db: db}
}

// Create creates a new loan facility in the database.
func (r *LoanFacilityRepositoryImpl) Create(ctx context.Context, lf *entities.LoanFacility) error {
	if lf.ID.IsNil() {
		lf.ID = uuid.New()
	}
	var companyID interface{} = nil
	if lf.CompanyID != "" {
		companyID = lf.CompanyID
	}
	query := `INSERT INTO loan_facilities (id, facility_name, lender, type, principal_amount, outstanding_amount, interest_rate, maturity_date, next_payment_date, next_payment_amount, status, company_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`
	_, err := r.db.ExecContext(ctx, query, lf.ID, lf.FacilityName, lf.Lender, lf.Type, lf.PrincipalAmount, lf.OutstandingAmount, lf.InterestRate, lf.MaturityDate, lf.NextPaymentDate, lf.NextPaymentAmount, lf.Status, companyID, lf.CreatedAt, lf.UpdatedAt)
	return err
}

// GetByID retrieves a loan facility by its ID from the database.
func (r *LoanFacilityRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.LoanFacility, error) {
	query := `SELECT id, facility_name, lender, type, principal_amount, outstanding_amount, interest_rate, maturity_date, next_payment_date, next_payment_amount, status, COALESCE(company_id::text, '') as company_id, created_at, updated_at FROM loan_facilities WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	lf := &entities.LoanFacility{}
	err := row.Scan(&lf.ID, &lf.FacilityName, &lf.Lender, &lf.Type, &lf.PrincipalAmount, &lf.OutstandingAmount, &lf.InterestRate, &lf.MaturityDate, &lf.NextPaymentDate, &lf.NextPaymentAmount, &lf.Status, &lf.CompanyID, &lf.CreatedAt, &lf.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Loan facility not found
	}
	return lf, err
}

// GetAll retrieves all loan facilities from the database.
func (r *LoanFacilityRepositoryImpl) GetAll(ctx context.Context) ([]*entities.LoanFacility, error) {
	var loanFacilities []*entities.LoanFacility
	query := `SELECT id, facility_name, lender, type, principal_amount, outstanding_amount, interest_rate, maturity_date, next_payment_date, next_payment_amount, status, COALESCE(company_id::text, '') as company_id, created_at, updated_at FROM loan_facilities ORDER BY facility_name ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		lf := &entities.LoanFacility{}
		if err := rows.Scan(&lf.ID, &lf.FacilityName, &lf.Lender, &lf.Type, &lf.PrincipalAmount, &lf.OutstandingAmount, &lf.InterestRate, &lf.MaturityDate, &lf.NextPaymentDate, &lf.NextPaymentAmount, &lf.Status, &lf.CompanyID, &lf.CreatedAt, &lf.UpdatedAt); err != nil {
			return nil, err
		}
		loanFacilities = append(loanFacilities, lf)
	}
	return loanFacilities, rows.Err()
}

// Update updates an existing loan facility in the database.
func (r *LoanFacilityRepositoryImpl) Update(ctx context.Context, lf *entities.LoanFacility) error {
	var companyID interface{} = nil
	if lf.CompanyID != "" {
		companyID = lf.CompanyID
	}
	query := `UPDATE loan_facilities SET facility_name = $1, lender = $2, type = $3, principal_amount = $4, outstanding_amount = $5, interest_rate = $6, maturity_date = $7, next_payment_date = $8, next_payment_amount = $9, status = $10, company_id = $11, updated_at = $12 WHERE id = $13`
	_, err := r.db.ExecContext(ctx, query, lf.FacilityName, lf.Lender, lf.Type, lf.PrincipalAmount, lf.OutstandingAmount, lf.InterestRate, lf.MaturityDate, lf.NextPaymentDate, lf.NextPaymentAmount, lf.Status, companyID, lf.UpdatedAt, lf.ID)
	return err
}

// Delete deletes a loan facility by its ID from the database.
func (r *LoanFacilityRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM loan_facilities WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
