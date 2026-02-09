package persistence

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// DepstoreRepositoryImpl implements repositories.DepstoreRepository.
type DepstoreRepositoryImpl struct {
	db *sqlx.DB
}

// NewDepstoreRepository creates a new DepstoreRepositoryImpl.
func NewDepstoreRepository(db *sqlx.DB) *DepstoreRepositoryImpl {
	return &DepstoreRepositoryImpl{db: db}
}

// Create creates a new department store in the database.
func (r *DepstoreRepositoryImpl) Create(ctx context.Context, depstore *entities.Depstore) error {
	query := `INSERT INTO depstores (id, code, name, address, city, phone, contact_person, commission_rate, payment_terms, company_id, status, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`
	_, err := r.db.ExecContext(ctx, query,
		depstore.ID, depstore.Code, depstore.Name, depstore.Address, depstore.City,
		depstore.Phone, depstore.ContactPerson, depstore.CommissionRate,
		depstore.PaymentTerms, depstore.CompanyID, depstore.Status)
	return err
}

// GetByID retrieves a department store by its ID from the database.
func (r *DepstoreRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Depstore, error) {
	depstore := &entities.Depstore{}
	query := `SELECT id, code, name, address, city, phone, contact_person, commission_rate, payment_terms, COALESCE(company_id::text, '') as company_id, status, created_at, updated_at
			  FROM depstores WHERE id = $1`
	err := r.db.GetContext(ctx, depstore, query, id)
	if err != nil {
		return nil, err
	}
	return depstore, nil
}

// GetAll retrieves all department stores from the database.
func (r *DepstoreRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Depstore, error) {
	var depstores []*entities.Depstore
	query := `SELECT id, code, name, address, city, phone, contact_person, commission_rate, payment_terms, COALESCE(company_id::text, '') as company_id, status, created_at, updated_at
			  FROM depstores ORDER BY name`
	err := r.db.SelectContext(ctx, &depstores, query)
	return depstores, err
}

// GetAllWithPagination retrieves department stores with pagination and filtering.
func (r *DepstoreRepositoryImpl) GetAllWithPagination(ctx context.Context, limit, offset int, search, status string) ([]*entities.Depstore, int, error) {
	// Build WHERE clause for filtering
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	
	if search != "" {
		whereClause += " AND (code ILIKE $1 OR name ILIKE $1 OR address ILIKE $1 OR city ILIKE $1 OR contact_person ILIKE $1)"
		args = append(args, "%"+search+"%")
	}
	
	if status != "" && status != "all" {
		if len(args) == 0 {
			whereClause += " AND status = $1"
		} else {
			whereClause += " AND status = $2"
		}
		args = append(args, status)
	}
	
	// Get total count
	countQuery := "SELECT COUNT(*) FROM depstores " + whereClause
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	
	// Get paginated data
	limitIndex := len(args) + 1
	offsetIndex := len(args) + 2
	
	query := fmt.Sprintf(`SELECT id, code, name, address, city, phone, contact_person, commission_rate, payment_terms, COALESCE(company_id::text, '') as company_id, status, created_at, updated_at
			  FROM depstores %s
			  ORDER BY name
			  LIMIT $%d OFFSET $%d`, whereClause, limitIndex, offsetIndex)
	
	// Add limit and offset to args
	paginationArgs := append(args, limit, offset)
	
	var depstores []*entities.Depstore
	err = r.db.SelectContext(ctx, &depstores, query, paginationArgs...)
	if err != nil {
		return nil, 0, err
	}
	
	return depstores, total, nil
}

// GetByCode retrieves a department store by its code from the database.
func (r *DepstoreRepositoryImpl) GetByCode(ctx context.Context, code string) (*entities.Depstore, error) {
	depstore := &entities.Depstore{}
	query := `SELECT id, code, name, address, city, phone, contact_person, commission_rate, payment_terms, COALESCE(company_id::text, '') as company_id, status, created_at, updated_at
			  FROM depstores WHERE code = $1`
	err := r.db.GetContext(ctx, depstore, query, code)
	if err != nil {
		return nil, err
	}
	return depstore, nil
}

// Update updates an existing department store in the database.
func (r *DepstoreRepositoryImpl) Update(ctx context.Context, depstore *entities.Depstore) error {
	query := `UPDATE depstores
			  SET code = $1, name = $2, address = $3, city = $4, phone = $5,
				  contact_person = $6, commission_rate = $7, payment_terms = $8,
				  company_id = $9, status = $10, updated_at = NOW()
			  WHERE id = $11`
	_, err := r.db.ExecContext(ctx, query,
		depstore.Code, depstore.Name, depstore.Address, depstore.City, depstore.Phone,
		depstore.ContactPerson, depstore.CommissionRate, depstore.PaymentTerms,
		depstore.CompanyID, depstore.Status, depstore.ID)
	return err
}

// Delete deletes a department store by its ID from the database.
func (r *DepstoreRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM depstores WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}