package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// PosTransactionRepositoryImpl implements repositories.PosTransactionRepository.
type PosTransactionRepositoryImpl struct {
	db *sqlx.DB
}

// NewPosTransactionRepositoryImpl creates a new PosTransactionRepositoryImpl.
func NewPosTransactionRepositoryImpl(db *sqlx.DB) *PosTransactionRepositoryImpl {
	return &PosTransactionRepositoryImpl{db: db}
}

// Create creates a new POS transaction in the database.
func (r *PosTransactionRepositoryImpl) Create(ctx context.Context, pt *entities.PosTransaction) error {
	query := `INSERT INTO pos_transactions (id, transaction_date, total_amount, payment_method, cashier_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, pt.ID, pt.TransactionDate, pt.TotalAmount, pt.PaymentMethod, pt.CashierID, pt.CreatedAt, pt.UpdatedAt)
	return err
}

// GetByID retrieves a POS transaction by its ID from the database.
func (r *PosTransactionRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.PosTransaction, error) {
	query := `SELECT id, transaction_date, total_amount, payment_method, cashier_id, created_at, updated_at FROM pos_transactions WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	pt := &entities.PosTransaction{}
	err := row.Scan(&pt.ID, &pt.TransactionDate, &pt.TotalAmount, &pt.PaymentMethod, &pt.CashierID, &pt.CreatedAt, &pt.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // POS transaction not found
	}
	return pt, err
}

// Update updates an existing POS transaction in the database.
func (r *PosTransactionRepositoryImpl) Update(ctx context.Context, pt *entities.PosTransaction) error {
	query := `UPDATE pos_transactions SET transaction_date = $1, total_amount = $2, payment_method = $3, cashier_id = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, pt.TransactionDate, pt.TotalAmount, pt.PaymentMethod, pt.CashierID, pt.UpdatedAt, pt.ID)
	return err
}

// Delete deletes a POS transaction by its ID from the database.
func (r *PosTransactionRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM pos_transactions WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
