package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
)

// WarehouseRepositoryImpl implements repositories.WarehouseRepository.
type WarehouseRepositoryImpl struct {
	db *sqlx.DB
}

// NewWarehouseRepositoryImpl creates a new WarehouseRepositoryImpl.
func NewWarehouseRepositoryImpl(db *sqlx.DB) *WarehouseRepositoryImpl {
	return &WarehouseRepositoryImpl{db: db}
}

// Create creates a new warehouse in the database.
func (r *WarehouseRepositoryImpl) Create(ctx context.Context, warehouse *entities.Warehouse) error {
	query := `INSERT INTO warehouses (id, name, address, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.ExecContext(ctx, query, warehouse.ID, warehouse.Name, warehouse.Address, warehouse.CreatedAt, warehouse.UpdatedAt)
	return err
}

// GetByID retrieves a warehouse by its ID from the database.
func (r *WarehouseRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Warehouse, error) {
	query := `SELECT id, name, address, created_at, updated_at FROM warehouses WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	warehouse := &entities.Warehouse{}
	err := row.Scan(&warehouse.ID, &warehouse.Name, &warehouse.Address, &warehouse.CreatedAt, &warehouse.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Warehouse not found
	}
	return warehouse, err
}

// Update updates an existing warehouse in the database.
func (r *WarehouseRepositoryImpl) Update(ctx context.Context, warehouse *entities.Warehouse) error {
	query := `UPDATE warehouses SET name = $1, address = $2, updated_at = $3 WHERE id = $4`
	_, err := r.db.ExecContext(ctx, query, warehouse.Name, warehouse.Address, warehouse.UpdatedAt, warehouse.ID)
	return err
}

// GetAll retrieves all warehouses from the database.
func (r *WarehouseRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Warehouse, error) {
	query := `SELECT id, name, address, created_at, updated_at FROM warehouses ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var warehouses []*entities.Warehouse
	for rows.Next() {
		warehouse := &entities.Warehouse{}
		err := rows.Scan(&warehouse.ID, &warehouse.Name, &warehouse.Address, &warehouse.CreatedAt, &warehouse.UpdatedAt)
		if err != nil {
			return nil, err
		}
		warehouses = append(warehouses, warehouse)
	}
	return warehouses, rows.Err()
}

// Delete deletes a warehouse by its ID from the database.
func (r *WarehouseRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM warehouses WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
