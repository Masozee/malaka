package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/finance/domain/entities"
)

// AccountsReceivableRepositoryImpl implements repositories.AccountsReceivableRepository.
type AccountsReceivableRepositoryImpl struct {
	db *sqlx.DB
}

// NewAccountsReceivableRepositoryImpl creates a new AccountsReceivableRepositoryImpl.
func NewAccountsReceivableRepositoryImpl(db *sqlx.DB) *AccountsReceivableRepositoryImpl {
	return &AccountsReceivableRepositoryImpl{db: db}
}

// Create creates a new accounts receivable record in the database.
func (r *AccountsReceivableRepositoryImpl) Create(ctx context.Context, ar *entities.AccountsReceivable) error {
	query := `INSERT INTO accounts_receivable (id, invoice_id, customer_id, issue_date, due_date, amount, paid_amount, balance, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	_, err := r.db.ExecContext(ctx, query, ar.ID, ar.InvoiceID, ar.CustomerID, ar.IssueDate, ar.DueDate, ar.Amount, ar.PaidAmount, ar.Balance, ar.Status, ar.CreatedAt, ar.UpdatedAt)
	return err
}

// GetByID retrieves an accounts receivable record by its ID from the database.
func (r *AccountsReceivableRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.AccountsReceivable, error) {
	query := `SELECT id, invoice_id, customer_id, issue_date, due_date, amount, paid_amount, balance, status, created_at, updated_at FROM accounts_receivable WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	ar := &entities.AccountsReceivable{}
	err := row.Scan(&ar.ID, &ar.InvoiceID, &ar.CustomerID, &ar.IssueDate, &ar.DueDate, &ar.Amount, &ar.PaidAmount, &ar.Balance, &ar.Status, &ar.CreatedAt, &ar.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Accounts receivable not found
	}
	return ar, err
}

// Update updates an existing accounts receivable record in the database.
func (r *AccountsReceivableRepositoryImpl) Update(ctx context.Context, ar *entities.AccountsReceivable) error {
	query := `UPDATE accounts_receivable SET invoice_id = $1, customer_id = $2, issue_date = $3, due_date = $4, amount = $5, paid_amount = $6, balance = $7, status = $8, updated_at = $9 WHERE id = $10`
	_, err := r.db.ExecContext(ctx, query, ar.InvoiceID, ar.CustomerID, ar.IssueDate, ar.DueDate, ar.Amount, ar.PaidAmount, ar.Balance, ar.Status, ar.UpdatedAt, ar.ID)
	return err
}

// Delete deletes an accounts receivable record by its ID from the database.
func (r *AccountsReceivableRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM accounts_receivable WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
