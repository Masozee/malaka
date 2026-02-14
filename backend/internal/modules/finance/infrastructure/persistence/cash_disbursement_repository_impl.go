package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
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
	if cd.ID.IsNil() {
		cd.ID = uuid.New()
	}
	query := `INSERT INTO cash_disbursements (id, disbursement_date, amount, description, cash_bank_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, cd.ID, cd.DisbursementDate, cd.Amount, cd.Description, cd.CashBankID, cd.CreatedAt, cd.UpdatedAt)
	return err
}

// GetByID retrieves a cash disbursement by its ID from the database.
func (r *CashDisbursementRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.CashDisbursement, error) {
	query := `SELECT id, disbursement_date, amount, description, cash_bank_id, created_at, updated_at FROM cash_disbursements WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	cd := &entities.CashDisbursement{}
	err := row.Scan(&cd.ID, &cd.DisbursementDate, &cd.Amount, &cd.Description, &cd.CashBankID, &cd.CreatedAt, &cd.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Cash disbursement not found
	}
	return cd, err
}

// GetAll retrieves all cash disbursements from the database.
func (r *CashDisbursementRepositoryImpl) GetAll(ctx context.Context) ([]*entities.CashDisbursement, error) {
	var items []*entities.CashDisbursement
	query := `SELECT id, disbursement_date, amount, description, cash_bank_id, created_at, updated_at FROM cash_disbursements ORDER BY disbursement_date DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		cd := &entities.CashDisbursement{}
		if err := rows.Scan(&cd.ID, &cd.DisbursementDate, &cd.Amount, &cd.Description, &cd.CashBankID, &cd.CreatedAt, &cd.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, cd)
	}
	return items, rows.Err()
}

// Update updates an existing cash disbursement in the database.
func (r *CashDisbursementRepositoryImpl) Update(ctx context.Context, cd *entities.CashDisbursement) error {
	query := `UPDATE cash_disbursements SET disbursement_date = $1, amount = $2, description = $3, cash_bank_id = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, cd.DisbursementDate, cd.Amount, cd.Description, cd.CashBankID, cd.UpdatedAt, cd.ID)
	return err
}

// Delete deletes a cash disbursement by its ID from the database.
func (r *CashDisbursementRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM cash_disbursements WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
