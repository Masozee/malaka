package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/finance/domain/entities"
)

// AccountsPayableRepositoryImpl implements repositories.AccountsPayableRepository.
type AccountsPayableRepositoryImpl struct {
	db *sqlx.DB
}

// NewAccountsPayableRepositoryImpl creates a new AccountsPayableRepositoryImpl.
func NewAccountsPayableRepositoryImpl(db *sqlx.DB) *AccountsPayableRepositoryImpl {
	return &AccountsPayableRepositoryImpl{db: db}
}

// Create creates a new accounts payable record in the database.
func (r *AccountsPayableRepositoryImpl) Create(ctx context.Context, ap *entities.AccountsPayable) error {
	query := `INSERT INTO accounts_payable (id, invoice_id, supplier_id, issue_date, due_date, amount, paid_amount, balance, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	_, err := r.db.ExecContext(ctx, query, ap.ID, ap.InvoiceID, ap.SupplierID, ap.IssueDate, ap.DueDate, ap.Amount, ap.PaidAmount, ap.Balance, ap.Status, ap.CreatedAt, ap.UpdatedAt)
	return err
}

// GetByID retrieves an accounts payable record by its ID from the database.
func (r *AccountsPayableRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.AccountsPayable, error) {
	query := `SELECT id, invoice_id, supplier_id, issue_date, due_date, amount, paid_amount, balance, status, created_at, updated_at FROM accounts_payable WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	ap := &entities.AccountsPayable{}
	err := row.Scan(&ap.ID, &ap.InvoiceID, &ap.SupplierID, &ap.IssueDate, &ap.DueDate, &ap.Amount, &ap.PaidAmount, &ap.Balance, &ap.Status, &ap.CreatedAt, &ap.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Accounts payable not found
	}
	return ap, err
}

// Update updates an existing accounts payable record in the database.
func (r *AccountsPayableRepositoryImpl) Update(ctx context.Context, ap *entities.AccountsPayable) error {
	query := `UPDATE accounts_payable SET invoice_id = $1, supplier_id = $2, issue_date = $3, due_date = $4, amount = $5, paid_amount = $6, balance = $7, status = $8, updated_at = $9 WHERE id = $10`
	_, err := r.db.ExecContext(ctx, query, ap.InvoiceID, ap.SupplierID, ap.IssueDate, ap.DueDate, ap.Amount, ap.PaidAmount, ap.Balance, ap.Status, ap.UpdatedAt, ap.ID)
	return err
}

// Delete deletes an accounts payable record by its ID from the database.
func (r *AccountsPayableRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM accounts_payable WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
