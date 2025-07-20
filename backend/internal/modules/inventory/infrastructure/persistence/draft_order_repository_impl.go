package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// DraftOrderRepositoryImpl implements repositories.DraftOrderRepository.
type DraftOrderRepositoryImpl struct {
	db *sqlx.DB
}

// NewDraftOrderRepositoryImpl creates a new DraftOrderRepositoryImpl.
func NewDraftOrderRepositoryImpl(db *sqlx.DB) *DraftOrderRepositoryImpl {
	return &DraftOrderRepositoryImpl{db: db}
}

// Create creates a new draft order in the database.
func (r *DraftOrderRepositoryImpl) Create(ctx context.Context, draftOrder *entities.DraftOrder) error {
	query := `INSERT INTO draft_orders (id, supplier_id, order_date, status, total_amount, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, draftOrder.ID, draftOrder.SupplierID, draftOrder.OrderDate, draftOrder.Status, draftOrder.TotalAmount, draftOrder.CreatedAt, draftOrder.UpdatedAt)
	return err
}

// GetByID retrieves a draft order by its ID from the database.
func (r *DraftOrderRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.DraftOrder, error) {
	query := `SELECT id, supplier_id, order_date, status, total_amount, created_at, updated_at FROM draft_orders WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	draftOrder := &entities.DraftOrder{}
	err := row.Scan(&draftOrder.ID, &draftOrder.SupplierID, &draftOrder.OrderDate, &draftOrder.Status, &draftOrder.TotalAmount, &draftOrder.CreatedAt, &draftOrder.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Draft order not found
	}
	return draftOrder, err
}

// Update updates an existing draft order in the database.
func (r *DraftOrderRepositoryImpl) Update(ctx context.Context, draftOrder *entities.DraftOrder) error {
	query := `UPDATE draft_orders SET supplier_id = $1, order_date = $2, status = $3, total_amount = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, draftOrder.SupplierID, draftOrder.OrderDate, draftOrder.Status, draftOrder.TotalAmount, draftOrder.UpdatedAt, draftOrder.ID)
	return err
}

// Delete deletes a draft order by its ID from the database.
func (r *DraftOrderRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM draft_orders WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetAll retrieves all draft orders from the database.
func (r *DraftOrderRepositoryImpl) GetAll(ctx context.Context) ([]*entities.DraftOrder, error) {
	query := `SELECT id, supplier_id, order_date, status, total_amount, created_at, updated_at FROM draft_orders ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var draftOrders []*entities.DraftOrder
	for rows.Next() {
		draftOrder := &entities.DraftOrder{}
		err := rows.Scan(&draftOrder.ID, &draftOrder.SupplierID, &draftOrder.OrderDate, &draftOrder.Status, &draftOrder.TotalAmount, &draftOrder.CreatedAt, &draftOrder.UpdatedAt)
		if err != nil {
			return nil, err
		}
		draftOrders = append(draftOrders, draftOrder)
	}
	return draftOrders, rows.Err()
}
