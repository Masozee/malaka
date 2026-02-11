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
	query := `INSERT INTO transfer_orders (id, from_warehouse_id, to_warehouse_id, order_date, status, notes, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := r.db.ExecContext(ctx, query, to.ID, to.FromWarehouseID, to.ToWarehouseID, to.OrderDate, to.Status, to.Notes, to.CreatedBy, to.CreatedAt, to.UpdatedAt)
	return err
}

// GetByID retrieves a transfer order by its ID from the database.
func (r *TransferOrderRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.TransferOrder, error) {
	query := `SELECT id, from_warehouse_id, to_warehouse_id, order_date, status,
		COALESCE(notes, '') as notes,
		shipped_date, received_date, approved_date, cancelled_date,
		shipped_by, received_by, approved_by, cancelled_by, created_by,
		COALESCE(cancel_reason, '') as cancel_reason,
		created_at, updated_at
	FROM transfer_orders WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	to := &entities.TransferOrder{}
	err := row.Scan(&to.ID, &to.FromWarehouseID, &to.ToWarehouseID, &to.OrderDate, &to.Status,
		&to.Notes,
		&to.ShippedDate, &to.ReceivedDate, &to.ApprovedDate, &to.CancelledDate,
		&to.ShippedBy, &to.ReceivedBy, &to.ApprovedBy, &to.CancelledBy, &to.CreatedBy,
		&to.CancelReason,
		&to.CreatedAt, &to.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return to, err
}

// Update updates an existing transfer order in the database.
func (r *TransferOrderRepositoryImpl) Update(ctx context.Context, to *entities.TransferOrder) error {
	query := `UPDATE transfer_orders SET from_warehouse_id = $1, to_warehouse_id = $2, order_date = $3, status = $4,
		notes = $5, shipped_date = $6, received_date = $7, approved_date = $8, cancelled_date = $9,
		shipped_by = $10, received_by = $11, approved_by = $12, cancelled_by = $13, created_by = $14,
		cancel_reason = $15, updated_at = $16
	WHERE id = $17`
	_, err := r.db.ExecContext(ctx, query,
		to.FromWarehouseID, to.ToWarehouseID, to.OrderDate, to.Status,
		to.Notes, to.ShippedDate, to.ReceivedDate, to.ApprovedDate, to.CancelledDate,
		to.ShippedBy, to.ReceivedBy, to.ApprovedBy, to.CancelledBy, to.CreatedBy,
		to.CancelReason, to.UpdatedAt,
		to.ID)
	return err
}

// GetAll retrieves all transfer orders from the database.
func (r *TransferOrderRepositoryImpl) GetAll(ctx context.Context) ([]*entities.TransferOrder, error) {
	query := `SELECT id, from_warehouse_id, to_warehouse_id, order_date, status,
		COALESCE(notes, '') as notes,
		shipped_date, received_date, approved_date, cancelled_date,
		shipped_by, received_by, approved_by, cancelled_by, created_by,
		COALESCE(cancel_reason, '') as cancel_reason,
		created_at, updated_at
	FROM transfer_orders ORDER BY order_date DESC, created_at DESC LIMIT 500`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transferOrders []*entities.TransferOrder
	for rows.Next() {
		to := &entities.TransferOrder{}
		err := rows.Scan(&to.ID, &to.FromWarehouseID, &to.ToWarehouseID, &to.OrderDate, &to.Status,
			&to.Notes,
			&to.ShippedDate, &to.ReceivedDate, &to.ApprovedDate, &to.CancelledDate,
			&to.ShippedBy, &to.ReceivedBy, &to.ApprovedBy, &to.CancelledBy, &to.CreatedBy,
			&to.CancelReason,
			&to.CreatedAt, &to.UpdatedAt)
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
