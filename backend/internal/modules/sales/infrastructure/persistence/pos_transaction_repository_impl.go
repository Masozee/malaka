package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/shared/uuid"
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
func (r *PosTransactionRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.PosTransaction, error) {
	query := `SELECT id, transaction_date, total_amount, payment_method, cashier_id, created_at, updated_at FROM pos_transactions WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	pt := &entities.PosTransaction{}
	err := row.Scan(&pt.ID, &pt.TransactionDate, &pt.TotalAmount, &pt.PaymentMethod, &pt.CashierID, &pt.CreatedAt, &pt.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // POS transaction not found
	}
	return pt, err
}

// GetAll retrieves all POS transactions from the database.
func (r *PosTransactionRepositoryImpl) GetAll(ctx context.Context) ([]*entities.PosTransaction, error) {
	query := `SELECT id, transaction_date, total_amount, payment_method, cashier_id, 
			  sales_person, customer_name, customer_phone, customer_address, 
			  visit_type, location, subtotal, tax_amount, discount_amount,
			  payment_status, delivery_method, delivery_status, 
			  commission_rate, commission_amount, notes,
			  created_at, updated_at 
			  FROM pos_transactions 
			  ORDER BY transaction_date DESC`
	
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []*entities.PosTransaction
	for rows.Next() {
		pt := &entities.PosTransaction{}
		var salesPerson, customerName, customerPhone, customerAddress sql.NullString
		var visitType, location sql.NullString
		var subtotal, taxAmount, discountAmount sql.NullFloat64
		var paymentStatus, deliveryMethod, deliveryStatus sql.NullString
		var commissionRate, commissionAmount sql.NullFloat64
		var notes sql.NullString
		
		err := rows.Scan(&pt.ID, &pt.TransactionDate, &pt.TotalAmount, &pt.PaymentMethod, &pt.CashierID,
			&salesPerson, &customerName, &customerPhone, &customerAddress,
			&visitType, &location, &subtotal, &taxAmount, &discountAmount,
			&paymentStatus, &deliveryMethod, &deliveryStatus,
			&commissionRate, &commissionAmount, &notes,
			&pt.CreatedAt, &pt.UpdatedAt)
		if err != nil {
			return nil, err
		}
		
		// Handle nullable fields
		pt.SalesPerson = salesPerson.String
		pt.CustomerName = customerName.String
		pt.CustomerPhone = customerPhone.String
		pt.CustomerAddress = customerAddress.String
		pt.VisitType = visitType.String
		pt.Location = location.String
		pt.Subtotal = subtotal.Float64
		pt.TaxAmount = taxAmount.Float64
		pt.DiscountAmount = discountAmount.Float64
		pt.PaymentStatus = paymentStatus.String
		pt.DeliveryMethod = deliveryMethod.String
		pt.DeliveryStatus = deliveryStatus.String
		pt.CommissionRate = commissionRate.Float64
		pt.CommissionAmount = commissionAmount.Float64
		pt.Notes = notes.String
		
		transactions = append(transactions, pt)
	}
	
	return transactions, rows.Err()
}

// Update updates an existing POS transaction in the database.
func (r *PosTransactionRepositoryImpl) Update(ctx context.Context, pt *entities.PosTransaction) error {
	query := `UPDATE pos_transactions SET transaction_date = $1, total_amount = $2, payment_method = $3, cashier_id = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, pt.TransactionDate, pt.TotalAmount, pt.PaymentMethod, pt.CashierID, pt.UpdatedAt, pt.ID)
	return err
}

// Delete deletes a POS transaction by its ID from the database.
func (r *PosTransactionRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM pos_transactions WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
