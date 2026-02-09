package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// PaymentRepositoryImpl implements repositories.PaymentRepository.
type PaymentRepositoryImpl struct {
	db *sqlx.DB
}

// NewPaymentRepositoryImpl creates a new PaymentRepositoryImpl.
func NewPaymentRepositoryImpl(db *sqlx.DB) *PaymentRepositoryImpl {
	return &PaymentRepositoryImpl{db: db}
}

// Create creates a new payment in the database.
func (r *PaymentRepositoryImpl) Create(ctx context.Context, payment *entities.Payment) error {
	if payment.ID.IsNil() {
		payment.ID = uuid.New()
	}
	query := `INSERT INTO payments (id, invoice_id, payment_date, amount, payment_method, cash_bank_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, payment.ID, payment.InvoiceID, payment.PaymentDate, payment.Amount, payment.PaymentMethod, payment.CashBankID, payment.CreatedAt, payment.UpdatedAt)
	return err
}

// GetByID retrieves a payment by its ID from the database.
func (r *PaymentRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Payment, error) {
	query := `SELECT id, invoice_id, payment_date, amount, payment_method, cash_bank_id, created_at, updated_at FROM payments WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	payment := &entities.Payment{}
	err := row.Scan(&payment.ID, &payment.InvoiceID, &payment.PaymentDate, &payment.Amount, &payment.PaymentMethod, &payment.CashBankID, &payment.CreatedAt, &payment.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Payment not found
	}
	return payment, err
}

// Update updates an existing payment in the database.
func (r *PaymentRepositoryImpl) Update(ctx context.Context, payment *entities.Payment) error {
	query := `UPDATE payments SET invoice_id = $1, payment_date = $2, amount = $3, payment_method = $4, cash_bank_id = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, payment.InvoiceID, payment.PaymentDate, payment.Amount, payment.PaymentMethod, payment.CashBankID, payment.UpdatedAt, payment.ID)
	return err
}

// Delete deletes a payment by its ID from the database.
func (r *PaymentRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM payments WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
