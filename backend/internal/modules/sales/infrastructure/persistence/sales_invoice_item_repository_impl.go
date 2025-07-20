package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// SalesInvoiceItemRepositoryImpl implements repositories.SalesInvoiceItemRepository.
type SalesInvoiceItemRepositoryImpl struct {
	db *sqlx.DB
}

// NewSalesInvoiceItemRepositoryImpl creates a new SalesInvoiceItemRepositoryImpl.
func NewSalesInvoiceItemRepositoryImpl(db *sqlx.DB) *SalesInvoiceItemRepositoryImpl {
	return &SalesInvoiceItemRepositoryImpl{db: db}
}

// Create creates a new sales invoice item in the database.
func (r *SalesInvoiceItemRepositoryImpl) Create(ctx context.Context, item *entities.SalesInvoiceItem) error {
	query := `INSERT INTO sales_invoice_items (id, sales_invoice_id, article_id, quantity, unit_price, total_price, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, item.ID, item.SalesInvoiceID, item.ArticleID, item.Quantity, item.UnitPrice, item.TotalPrice, item.CreatedAt, item.UpdatedAt)
	return err
}

// GetByID retrieves a sales invoice item by its ID from the database.
func (r *SalesInvoiceItemRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.SalesInvoiceItem, error) {
	query := `SELECT id, sales_invoice_id, article_id, quantity, unit_price, total_price, created_at, updated_at FROM sales_invoice_items WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	item := &entities.SalesInvoiceItem{}
	err := row.Scan(&item.ID, &item.SalesInvoiceID, &item.ArticleID, &item.Quantity, &item.UnitPrice, &item.TotalPrice, &item.CreatedAt, &item.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Sales invoice item not found
	}
	return item, err
}

// Update updates an existing sales invoice item in the database.
func (r *SalesInvoiceItemRepositoryImpl) Update(ctx context.Context, item *entities.SalesInvoiceItem) error {
	query := `UPDATE sales_invoice_items SET sales_invoice_id = $1, article_id = $2, quantity = $3, unit_price = $4, total_price = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, item.SalesInvoiceID, item.ArticleID, item.Quantity, item.UnitPrice, item.TotalPrice, item.UpdatedAt, item.ID)
	return err
}

// Delete deletes a sales invoice item by its ID from the database.
func (r *SalesInvoiceItemRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM sales_invoice_items WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
