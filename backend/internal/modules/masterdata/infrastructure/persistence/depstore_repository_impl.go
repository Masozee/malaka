package persistence

import (
	"context"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
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
	query := `INSERT INTO depstores (id, name, code, address, contact, payment_terms, is_active, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`
	_, err := r.db.ExecContext(ctx, query, 
		depstore.ID, depstore.Name, depstore.Code, depstore.Address, 
		depstore.Contact, depstore.PaymentTerms, depstore.IsActive)
	return err
}

// GetByID retrieves a department store by its ID from the database.
func (r *DepstoreRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.Depstore, error) {
	depstore := &entities.Depstore{}
	query := `SELECT id, name, code, address, contact, payment_terms, is_active, created_at, updated_at 
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
	query := `SELECT id, name, code, address, contact, payment_terms, is_active, created_at, updated_at 
			  FROM depstores ORDER BY name`
	err := r.db.SelectContext(ctx, &depstores, query)
	return depstores, err
}

// GetByCode retrieves a department store by its code from the database.
func (r *DepstoreRepositoryImpl) GetByCode(ctx context.Context, code string) (*entities.Depstore, error) {
	depstore := &entities.Depstore{}
	query := `SELECT id, name, code, address, contact, payment_terms, is_active, created_at, updated_at 
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
			  SET name = $1, code = $2, address = $3, contact = $4, payment_terms = $5, 
				  is_active = $6, updated_at = NOW() 
			  WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, 
		depstore.Name, depstore.Code, depstore.Address, depstore.Contact, 
		depstore.PaymentTerms, depstore.IsActive, depstore.ID)
	return err
}

// Delete deletes a department store by its ID from the database.
func (r *DepstoreRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM depstores WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}