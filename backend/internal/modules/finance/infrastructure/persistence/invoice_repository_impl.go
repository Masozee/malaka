package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// InvoiceRepositoryImpl implements repositories.InvoiceRepository.
type InvoiceRepositoryImpl struct {
	db *sqlx.DB
}

// NewInvoiceRepositoryImpl creates a new InvoiceRepositoryImpl.
func NewInvoiceRepositoryImpl(db *sqlx.DB) *InvoiceRepositoryImpl {
	return &InvoiceRepositoryImpl{db: db}
}

// Create creates a new invoice in the database.
func (r *InvoiceRepositoryImpl) Create(ctx context.Context, invoice *entities.Invoice) error {
	if invoice.ID.IsNil() {
		invoice.ID = uuid.New()
	}
	query := `INSERT INTO invoices (id, invoice_number, invoice_date, due_date, total_amount, tax_amount, grand_total, customer_id, supplier_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	_, err := r.db.ExecContext(ctx, query, invoice.ID, invoice.InvoiceNumber, invoice.InvoiceDate, invoice.DueDate, invoice.TotalAmount, invoice.TaxAmount, invoice.GrandTotal, invoice.CustomerID, invoice.SupplierID, invoice.CreatedAt, invoice.UpdatedAt)
	return err
}

// GetByID retrieves an invoice by its ID from the database.
func (r *InvoiceRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Invoice, error) {
	query := `SELECT id, invoice_number, invoice_date, due_date, total_amount, tax_amount, grand_total, customer_id, supplier_id, created_at, updated_at FROM invoices WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	invoice := &entities.Invoice{}
	err := row.Scan(&invoice.ID, &invoice.InvoiceNumber, &invoice.InvoiceDate, &invoice.DueDate, &invoice.TotalAmount, &invoice.TaxAmount, &invoice.GrandTotal, &invoice.CustomerID, &invoice.SupplierID, &invoice.CreatedAt, &invoice.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Invoice not found
	}
	return invoice, err
}

// Update updates an existing invoice in the database.
func (r *InvoiceRepositoryImpl) Update(ctx context.Context, invoice *entities.Invoice) error {
	query := `UPDATE invoices SET invoice_number = $1, invoice_date = $2, due_date = $3, total_amount = $4, tax_amount = $5, grand_total = $6, customer_id = $7, supplier_id = $8, updated_at = $9 WHERE id = $10`
	_, err := r.db.ExecContext(ctx, query, invoice.InvoiceNumber, invoice.InvoiceDate, invoice.DueDate, invoice.TotalAmount, invoice.TaxAmount, invoice.GrandTotal, invoice.CustomerID, invoice.SupplierID, invoice.UpdatedAt, invoice.ID)
	return err
}

// Delete deletes an invoice by its ID from the database.
func (r *InvoiceRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM invoices WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
