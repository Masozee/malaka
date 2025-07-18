package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/finance/domain/entities"
)

// CashBankRepositoryImpl implements repositories.CashBankRepository.
type CashBankRepositoryImpl struct {
	db *sqlx.DB
}

// NewCashBankRepositoryImpl creates a new CashBankRepositoryImpl.
func NewCashBankRepositoryImpl(db *sqlx.DB) *CashBankRepositoryImpl {
	return &CashBankRepositoryImpl{db: db}
}

// Create creates a new cash/bank account in the database.
func (r *CashBankRepositoryImpl) Create(ctx context.Context, cb *entities.CashBank) error {
	query := `INSERT INTO cash_banks (id, name, account_no, balance, currency, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, cb.ID, cb.Name, cb.AccountNo, cb.Balance, cb.Currency, cb.CreatedAt, cb.UpdatedAt)
	return err
}

// GetByID retrieves a cash/bank account by its ID from the database.
func (r *CashBankRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.CashBank, error) {
	query := `SELECT id, name, account_no, balance, currency, created_at, updated_at FROM cash_banks WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	cb := &entities.CashBank{}
	err := row.Scan(&cb.ID, &cb.Name, &cb.AccountNo, &cb.Balance, &cb.Currency, &cb.CreatedAt, &cb.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Cash/bank account not found
	}
	return cb, err
}

// Update updates an existing cash/bank account in the database.
func (r *CashBankRepositoryImpl) Update(ctx context.Context, cb *entities.CashBank) error {
	query := `UPDATE cash_banks SET name = $1, account_no = $2, balance = $3, currency = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, cb.Name, cb.AccountNo, cb.Balance, cb.Currency, cb.UpdatedAt, cb.ID)
	return err
}

// Delete deletes a cash/bank account by its ID from the database.
func (r *CashBankRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM cash_banks WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
