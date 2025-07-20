package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// SalesRekonsiliasiRepositoryImpl implements repositories.SalesRekonsiliasiRepository.
type SalesRekonsiliasiRepositoryImpl struct {
	db *sqlx.DB
}

// NewSalesRekonsiliasiRepositoryImpl creates a new SalesRekonsiliasiRepositoryImpl.
func NewSalesRekonsiliasiRepositoryImpl(db *sqlx.DB) *SalesRekonsiliasiRepositoryImpl {
	return &SalesRekonsiliasiRepositoryImpl{db: db}
}

// Create creates a new sales reconciliation entry in the database.
func (r *SalesRekonsiliasiRepositoryImpl) Create(ctx context.Context, sr *entities.SalesRekonsiliasi) error {
	query := `INSERT INTO sales_rekonsiliasi (id, reconciliation_date, sales_amount, payment_amount, discrepancy, status, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := r.db.ExecContext(ctx, query, sr.ID, sr.ReconciliationDate, sr.SalesAmount, sr.PaymentAmount, sr.Discrepancy, sr.Status, sr.Notes, sr.CreatedAt, sr.UpdatedAt)
	return err
}

// GetByID retrieves a sales reconciliation entry by its ID from the database.
func (r *SalesRekonsiliasiRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.SalesRekonsiliasi, error) {
	query := `SELECT id, reconciliation_date, sales_amount, payment_amount, discrepancy, status, notes, created_at, updated_at FROM sales_rekonsiliasi WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	sr := &entities.SalesRekonsiliasi{}
	err := row.Scan(&sr.ID, &sr.ReconciliationDate, &sr.SalesAmount, &sr.PaymentAmount, &sr.Discrepancy, &sr.Status, &sr.Notes, &sr.CreatedAt, &sr.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Sales reconciliation entry not found
	}
	return sr, err
}

// GetAll retrieves all sales reconciliation entries from the database.
func (r *SalesRekonsiliasiRepositoryImpl) GetAll(ctx context.Context) ([]*entities.SalesRekonsiliasi, error) {
	query := `SELECT id, reconciliation_date, sales_amount, payment_amount, discrepancy, status, notes, created_at, updated_at FROM sales_rekonsiliasi`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var srs []*entities.SalesRekonsiliasi
	for rows.Next() {
		sr := &entities.SalesRekonsiliasi{}
		if err := rows.Scan(&sr.ID, &sr.ReconciliationDate, &sr.SalesAmount, &sr.PaymentAmount, &sr.Discrepancy, &sr.Status, &sr.Notes, &sr.CreatedAt, &sr.UpdatedAt); err != nil {
			return nil, err
		}
		srs = append(srs, sr)
	}

	return srs, nil
}

// Update updates an existing sales reconciliation entry in the database.
func (r *SalesRekonsiliasiRepositoryImpl) Update(ctx context.Context, sr *entities.SalesRekonsiliasi) error {
	query := `UPDATE sales_rekonsiliasi SET reconciliation_date = $1, sales_amount = $2, payment_amount = $3, discrepancy = $4, status = $5, notes = $6, updated_at = $7 WHERE id = $8`
	_, err := r.db.ExecContext(ctx, query, sr.ReconciliationDate, sr.SalesAmount, sr.PaymentAmount, sr.Discrepancy, sr.Status, sr.Notes, sr.UpdatedAt, sr.ID)
	return err
}

// Delete deletes a sales reconciliation entry by its ID from the database.
func (r *SalesRekonsiliasiRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM sales_rekonsiliasi WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
