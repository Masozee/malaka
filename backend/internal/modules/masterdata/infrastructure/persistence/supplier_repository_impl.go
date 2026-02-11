package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// SupplierRepositoryImpl implements repositories.SupplierRepository.
type SupplierRepositoryImpl struct {
	db *sqlx.DB
}

// NewSupplierRepositoryImpl creates a new SupplierRepositoryImpl.
func NewSupplierRepositoryImpl(db *sqlx.DB) *SupplierRepositoryImpl {
	return &SupplierRepositoryImpl{db: db}
}

// Create creates a new supplier in the database.
func (r *SupplierRepositoryImpl) Create(ctx context.Context, supplier *entities.Supplier) error {
	query := `INSERT INTO suppliers (id, code, name, address, contact, contact_person, phone, email, website, tax_id, payment_terms, credit_limit, status, company_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`
	var companyID interface{} = nil
	if supplier.CompanyID != "" {
		companyID = supplier.CompanyID
	}
	_, err := r.db.ExecContext(ctx, query,
		supplier.ID, supplier.Code, supplier.Name, supplier.Address, supplier.Contact,
		supplier.ContactPerson, supplier.Phone, supplier.Email, supplier.Website,
		supplier.TaxID, supplier.PaymentTerms, supplier.CreditLimit, supplier.Status,
		companyID, supplier.CreatedAt, supplier.UpdatedAt,
	)
	return err
}

// GetByID retrieves a supplier by its ID from the database.
func (r *SupplierRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Supplier, error) {
	query := `SELECT id, COALESCE(code, '') as code, name, COALESCE(address, '') as address,
		COALESCE(contact, '') as contact, COALESCE(contact_person, '') as contact_person,
		COALESCE(phone, '') as phone, COALESCE(email, '') as email,
		COALESCE(website, '') as website, COALESCE(tax_id, '') as tax_id,
		COALESCE(payment_terms, '') as payment_terms, COALESCE(credit_limit, 0) as credit_limit,
		COALESCE(status, 'active') as status, COALESCE(company_id::text, '') as company_id,
		created_at, updated_at
		FROM suppliers WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	supplier := &entities.Supplier{}
	err := row.Scan(
		&supplier.ID, &supplier.Code, &supplier.Name, &supplier.Address,
		&supplier.Contact, &supplier.ContactPerson, &supplier.Phone, &supplier.Email,
		&supplier.Website, &supplier.TaxID, &supplier.PaymentTerms, &supplier.CreditLimit,
		&supplier.Status, &supplier.CompanyID, &supplier.CreatedAt, &supplier.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil // Supplier not found
	}
	return supplier, err
}

// Update updates an existing supplier in the database.
func (r *SupplierRepositoryImpl) Update(ctx context.Context, supplier *entities.Supplier) error {
	query := `UPDATE suppliers SET code = $1, name = $2, address = $3, contact = $4,
		contact_person = $5, phone = $6, email = $7, website = $8, tax_id = $9,
		payment_terms = $10, credit_limit = $11, status = $12, company_id = $13, updated_at = $14
		WHERE id = $15`
	var companyID interface{} = nil
	if supplier.CompanyID != "" {
		companyID = supplier.CompanyID
	}
	_, err := r.db.ExecContext(ctx, query,
		supplier.Code, supplier.Name, supplier.Address, supplier.Contact,
		supplier.ContactPerson, supplier.Phone, supplier.Email, supplier.Website,
		supplier.TaxID, supplier.PaymentTerms, supplier.CreditLimit, supplier.Status,
		companyID, supplier.UpdatedAt, supplier.ID,
	)
	return err
}

// GetAll retrieves all suppliers from the database.
func (r *SupplierRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Supplier, error) {
	query := `SELECT id, COALESCE(code, '') as code, name, COALESCE(address, '') as address,
		COALESCE(contact, '') as contact, COALESCE(contact_person, '') as contact_person,
		COALESCE(phone, '') as phone, COALESCE(email, '') as email,
		COALESCE(website, '') as website, COALESCE(tax_id, '') as tax_id,
		COALESCE(payment_terms, '') as payment_terms, COALESCE(credit_limit, 0) as credit_limit,
		COALESCE(status, 'active') as status, COALESCE(company_id::text, '') as company_id,
		created_at, updated_at
		FROM suppliers ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var suppliers []*entities.Supplier
	for rows.Next() {
		supplier := &entities.Supplier{}
		err := rows.Scan(
			&supplier.ID, &supplier.Code, &supplier.Name, &supplier.Address,
			&supplier.Contact, &supplier.ContactPerson, &supplier.Phone, &supplier.Email,
			&supplier.Website, &supplier.TaxID, &supplier.PaymentTerms, &supplier.CreditLimit,
			&supplier.Status, &supplier.CompanyID, &supplier.CreatedAt, &supplier.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		suppliers = append(suppliers, supplier)
	}
	return suppliers, rows.Err()
}

// Delete deletes a supplier by its ID from the database.
func (r *SupplierRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM suppliers WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
