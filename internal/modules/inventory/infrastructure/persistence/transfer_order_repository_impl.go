package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// TransferOrderRepositoryImpl implements repositories.TransferOrderRepository.
type TransferOrderRepositoryImpl struct {
	db *sqlx.DB
}

// NewTransferOrderRepositoryImpl creates a new TransferOrderRepositoryImpl.
func NewTransferOrderRepositoryImpl(db *sqlx.DB) *TransferOrderRepositoryImpl {
	return &TransferOrderRepositoryImpl{db: db}
}

// Create creates a new transfer order in the database.
func (r *TransferOrderRepositoryImpl) Create(ctx context.Context, to *entities.TransferOrder) error {
	query := `INSERT INTO transfer_orders (id, from_warehouse_id, to_warehouse_id, order_date, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, to.ID, to.FromWarehouseID, to.ToWarehouseID, to.OrderDate, to.Status, to.CreatedAt, to.UpdatedAt)
	return err
}

// GetByID retrieves a transfer order by its ID from the database.
func (r *TransferOrderRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.TransferOrder, error) {
	query := `SELECT id, from_warehouse_id, to_warehouse_id, order_date, status, created_at, updated_at FROM transfer_orders WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	to := &entities.TransferOrder{}
	err := row.Scan(&to.ID, &to.FromWarehouseID, &to.ToWarehouseID, &to.OrderDate, &to.Status, &to.CreatedAt, &to.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Transfer order not found
	}
	return to, err
}

// Update updates an existing transfer order in the database.
func (r *TransferOrderRepositoryImpl) Update(ctx context.Context, to *entities.TransferOrder) error {
	query := `UPDATE transfer_orders SET from_warehouse_id = $1, to_warehouse_id = $2, order_date = $3, status = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, to.FromWarehouseID, to.ToWarehouseID, to.OrderDate, to.Status, to.UpdatedAt, to.ID)
	return err
}

// GetAll retrieves all transfer orders from the database.
func (r *TransferOrderRepositoryImpl) GetAll(ctx context.Context) ([]*entities.TransferOrder, error) {
	query := `SELECT id, from_warehouse_id, to_warehouse_id, order_date, status, created_at, updated_at FROM transfer_orders ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transferOrders []*entities.TransferOrder
	for rows.Next() {
		to := &entities.TransferOrder{}
		err := rows.Scan(&to.ID, &to.FromWarehouseID, &to.ToWarehouseID, &to.OrderDate, &to.Status, &to.CreatedAt, &to.UpdatedAt)
		if err != nil {
			return nil, err
		}
		transferOrders = append(transferOrders, to)
	}
	return transferOrders, rows.Err()
}

// Delete deletes a transfer order by its ID from the database.
func (r *TransferOrderRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM transfer_orders WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
