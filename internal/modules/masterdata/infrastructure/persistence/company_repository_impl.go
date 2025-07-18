package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
)

// CompanyRepositoryImpl implements repositories.CompanyRepository.
type CompanyRepositoryImpl struct {
	db *sqlx.DB
}

// NewCompanyRepositoryImpl creates a new CompanyRepositoryImpl.
func NewCompanyRepositoryImpl(db *sqlx.DB) *CompanyRepositoryImpl {
	return &CompanyRepositoryImpl{db: db}
}

// Create creates a new company in the database.
func (r *CompanyRepositoryImpl) Create(ctx context.Context, company *entities.Company) error {
	query := `INSERT INTO companies (id, name, address, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.ExecContext(ctx, query, company.ID, company.Name, company.Address, company.CreatedAt, company.UpdatedAt)
	return err
}

// GetByID retrieves a company by its ID from the database.
func (r *CompanyRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Company, error) {
	query := `SELECT id, name, address, created_at, updated_at FROM companies WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	company := &entities.Company{}
	err := row.Scan(&company.ID, &company.Name, &company.Address, &company.CreatedAt, &company.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Company not found
	}
	return company, err
}

// GetAll retrieves all companies from the database.
func (r *CompanyRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Company, error) {
	query := `SELECT id, name, address, created_at, updated_at FROM companies ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var companies []*entities.Company
	for rows.Next() {
		company := &entities.Company{}
		err := rows.Scan(&company.ID, &company.Name, &company.Address, &company.CreatedAt, &company.UpdatedAt)
		if err != nil {
			return nil, err
		}
		companies = append(companies, company)
	}
	return companies, rows.Err()
}

// Update updates an existing company in the database.
func (r *CompanyRepositoryImpl) Update(ctx context.Context, company *entities.Company) error {
	query := `UPDATE companies SET name = $1, address = $2, updated_at = $3 WHERE id = $4`
	_, err := r.db.ExecContext(ctx, query, company.Name, company.Address, company.UpdatedAt, company.ID)
	return err
}

// Delete deletes a company by its ID from the database.
func (r *CompanyRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM companies WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
