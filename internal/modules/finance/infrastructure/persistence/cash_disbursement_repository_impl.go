package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/finance/domain/entities"
)

// CashDisbursementRepositoryImpl implements repositories.CashDisbursementRepository.
type CashDisbursementRepositoryImpl struct {
	db *sqlx.DB
}

// NewCashDisbursementRepositoryImpl creates a new CashDisbursementRepositoryImpl.
func NewCashDisbursementRepositoryImpl(db *sqlx.DB) *CashDisbursementRepositoryImpl {
	return &CashDisbursementRepositoryImpl{db: db}
}

// Create creates a new cash disbursement in the database.
func (r *CashDisbursementRepositoryImpl) Create(ctx context.Context, cd *entities.CashDisbursement) error {
	query := `INSERT INTO cash_disbursements (id, disbursement_date, amount, description, cash_bank_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, cd.ID, cd.DisbursementDate, cd.Amount, cd.Description, cd.CashBankID, cd.CreatedAt, cd.UpdatedAt)
	return err
}

// GetByID retrieves a cash disbursement by its ID from the database.
func (r *CashDisbursementRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.CashDisbursement, error) {
	query := `SELECT id, disbursement_date, amount, description, cash_bank_id, created_at, updated_at FROM cash_disbursements WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	cd := &entities.CashDisbursement{}
	err := row.Scan(&cd.ID, &cd.DisbursementDate, &cd.Amount, &cd.Description, &cd.CashBankID, &cd.CreatedAt, &cd.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Cash disbursement not found
	}
	return cd, err
}

// Update updates an existing cash disbursement in the database.
func (r *CashDisbursementRepositoryImpl) Update(ctx context.Context, cd *entities.CashDisbursement) error {
	query := `UPDATE cash_disbursements SET disbursement_date = $1, amount = $2, description = $3, cash_bank_id = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, cd.DisbursementDate, cd.Amount, cd.Description, cd.CashBankID, cd.UpdatedAt, cd.ID)
	return err
}

// Delete deletes a cash disbursement by its ID from the database.
func (r *CashDisbursementRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM cash_disbursements WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
