package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// SalesInvoiceRepositoryImpl implements repositories.SalesInvoiceRepository.
type SalesInvoiceRepositoryImpl struct {
	db *sqlx.DB
}

// NewSalesInvoiceRepositoryImpl creates a new SalesInvoiceRepositoryImpl.
func NewSalesInvoiceRepositoryImpl(db *sqlx.DB) *SalesInvoiceRepositoryImpl {
	return &SalesInvoiceRepositoryImpl{db: db}
}

// Create creates a new sales invoice in the database.
func (r *SalesInvoiceRepositoryImpl) Create(ctx context.Context, invoice *entities.SalesInvoice) error {
	query := `INSERT INTO sales_invoices (id, sales_order_id, invoice_date, total_amount, tax_amount, grand_total, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, invoice.ID, invoice.SalesOrderID, invoice.InvoiceDate, invoice.TotalAmount, invoice.TaxAmount, invoice.GrandTotal, invoice.CreatedAt, invoice.UpdatedAt)
	return err
}

// GetByID retrieves a sales invoice by its ID from the database.
func (r *SalesInvoiceRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.SalesInvoice, error) {
	query := `SELECT id, sales_order_id, invoice_date, total_amount, tax_amount, grand_total, created_at, updated_at FROM sales_invoices WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	invoice := &entities.SalesInvoice{}
	err := row.Scan(&invoice.ID, &invoice.SalesOrderID, &invoice.InvoiceDate, &invoice.TotalAmount, &invoice.TaxAmount, &invoice.GrandTotal, &invoice.CreatedAt, &invoice.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Sales invoice not found
	}
	return invoice, err
}

// Update updates an existing sales invoice in the database.
func (r *SalesInvoiceRepositoryImpl) Update(ctx context.Context, invoice *entities.SalesInvoice) error {
	query := `UPDATE sales_invoices SET sales_order_id = $1, invoice_date = $2, total_amount = $3, tax_amount = $4, grand_total = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, invoice.SalesOrderID, invoice.InvoiceDate, invoice.TotalAmount, invoice.TaxAmount, invoice.GrandTotal, invoice.UpdatedAt, invoice.ID)
	return err
}

// Delete deletes a sales invoice by its ID from the database.
func (r *SalesInvoiceRepositoryImpl) GetAll(ctx context.Context) ([]*entities.SalesInvoice, error) {
	query := `SELECT id, sales_order_id, invoice_date, total_amount, tax_amount, grand_total, created_at, updated_at FROM sales_invoices ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var salesInvoices []*entities.SalesInvoice
	for rows.Next() {
		invoice := &entities.SalesInvoice{}
		err := rows.Scan(&invoice.ID, &invoice.SalesOrderID, &invoice.InvoiceDate, &invoice.TotalAmount, &invoice.TaxAmount, &invoice.GrandTotal, &invoice.CreatedAt, &invoice.UpdatedAt)
		if err != nil {
			return nil, err
		}
		salesInvoices = append(salesInvoices, invoice)
	}
	return salesInvoices, rows.Err()
}

func (r *SalesInvoiceRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM sales_invoices WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
