package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/finance/domain/entities"
)

// CashReceiptRepositoryImpl implements repositories.CashReceiptRepository.
type CashReceiptRepositoryImpl struct {
	db *sqlx.DB
}

// NewCashReceiptRepositoryImpl creates a new CashReceiptRepositoryImpl.
func NewCashReceiptRepositoryImpl(db *sqlx.DB) *CashReceiptRepositoryImpl {
	return &CashReceiptRepositoryImpl{db: db}
}

// Create creates a new cash receipt in the database.
func (r *CashReceiptRepositoryImpl) Create(ctx context.Context, cr *entities.CashReceipt) error {
	query := `INSERT INTO cash_receipts (id, receipt_date, amount, description, cash_bank_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, cr.ID, cr.ReceiptDate, cr.Amount, cr.Description, cr.CashBankID, cr.CreatedAt, cr.UpdatedAt)
	return err
}

// GetByID retrieves a cash receipt by its ID from the database.
func (r *CashReceiptRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.CashReceipt, error) {
	query := `SELECT id, receipt_date, amount, description, cash_bank_id, created_at, updated_at FROM cash_receipts WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	cr := &entities.CashReceipt{}
	err := row.Scan(&cr.ID, &cr.ReceiptDate, &cr.Amount, &cr.Description, &cr.CashBankID, &cr.CreatedAt, &cr.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Cash receipt not found
	}
	return cr, err
}

// Update updates an existing cash receipt in the database.
func (r *CashReceiptRepositoryImpl) Update(ctx context.Context, cr *entities.CashReceipt) error {
	query := `UPDATE cash_receipts SET receipt_date = $1, amount = $2, description = $3, cash_bank_id = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, cr.ReceiptDate, cr.Amount, cr.Description, cr.CashBankID, cr.UpdatedAt, cr.ID)
	return err
}

// Delete deletes a cash receipt by its ID from the database.
func (r *CashReceiptRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM cash_receipts WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
