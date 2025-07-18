package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/finance/domain/entities"
)

// BankTransferRepositoryImpl implements repositories.BankTransferRepository.
type BankTransferRepositoryImpl struct {
	db *sqlx.DB
}

// NewBankTransferRepositoryImpl creates a new BankTransferRepositoryImpl.
func NewBankTransferRepositoryImpl(db *sqlx.DB) *BankTransferRepositoryImpl {
	return &BankTransferRepositoryImpl{db: db}
}

// Create creates a new bank transfer in the database.
func (r *BankTransferRepositoryImpl) Create(ctx context.Context, bt *entities.BankTransfer) error {
	query := `INSERT INTO bank_transfers (id, transfer_date, from_cash_bank_id, to_cash_bank_id, amount, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, bt.ID, bt.TransferDate, bt.FromCashBankID, bt.ToCashBankID, bt.Amount, bt.Description, bt.CreatedAt, bt.UpdatedAt)
	return err
}

// GetByID retrieves a bank transfer by its ID from the database.
func (r *BankTransferRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.BankTransfer, error) {
	query := `SELECT id, transfer_date, from_cash_bank_id, to_cash_bank_id, amount, description, created_at, updated_at FROM bank_transfers WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	bt := &entities.BankTransfer{}
	err := row.Scan(&bt.ID, &bt.TransferDate, &bt.FromCashBankID, &bt.ToCashBankID, &bt.Amount, &bt.Description, &bt.CreatedAt, &bt.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Bank transfer not found
	}
	return bt, err
}

// Update updates an existing bank transfer in the database.
func (r *BankTransferRepositoryImpl) Update(ctx context.Context, bt *entities.BankTransfer) error {
	query := `UPDATE bank_transfers SET transfer_date = $1, from_cash_bank_id = $2, to_cash_bank_id = $3, amount = $4, description = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, bt.TransferDate, bt.FromCashBankID, bt.ToCashBankID, bt.Amount, bt.Description, bt.UpdatedAt, bt.ID)
	return err
}

// Delete deletes a bank transfer by its ID from the database.
func (r *BankTransferRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM bank_transfers WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
