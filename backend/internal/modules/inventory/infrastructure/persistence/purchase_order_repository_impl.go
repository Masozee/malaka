package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// PurchaseOrderRepositoryImpl implements repositories.PurchaseOrderRepository.
type PurchaseOrderRepositoryImpl struct {
	db *sqlx.DB
}

// NewPurchaseOrderRepositoryImpl creates a new PurchaseOrderRepositoryImpl.
func NewPurchaseOrderRepositoryImpl(db *sqlx.DB) *PurchaseOrderRepositoryImpl {
	return &PurchaseOrderRepositoryImpl{db: db}
}

// Create creates a new purchase order in the database.
func (r *PurchaseOrderRepositoryImpl) Create(ctx context.Context, po *entities.PurchaseOrder) error {
	query := `INSERT INTO purchase_orders (id, supplier_id, order_date, status, total_amount, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, po.ID, po.SupplierID, po.OrderDate, po.Status, po.TotalAmount, po.CreatedAt, po.UpdatedAt)
	return err
}

// GetByID retrieves a purchase order by its ID from the database.
func (r *PurchaseOrderRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.PurchaseOrder, error) {
	query := `SELECT id, supplier_id, order_date, status, total_amount, created_at, updated_at FROM purchase_orders WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	po := &entities.PurchaseOrder{}
	err := row.Scan(&po.ID, &po.SupplierID, &po.OrderDate, &po.Status, &po.TotalAmount, &po.CreatedAt, &po.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Purchase order not found
	}
	return po, err
}

// Update updates an existing purchase order in the database.
func (r *PurchaseOrderRepositoryImpl) Update(ctx context.Context, po *entities.PurchaseOrder) error {
	query := `UPDATE purchase_orders SET supplier_id = $1, order_date = $2, status = $3, total_amount = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, po.SupplierID, po.OrderDate, po.Status, po.TotalAmount, po.UpdatedAt, po.ID)
	return err
}

// GetAll retrieves all purchase orders from the database.
func (r *PurchaseOrderRepositoryImpl) GetAll(ctx context.Context) ([]*entities.PurchaseOrder, error) {
	query := `SELECT id, supplier_id, order_date, status, total_amount, created_at, updated_at FROM purchase_orders ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var purchaseOrders []*entities.PurchaseOrder
	for rows.Next() {
		po := &entities.PurchaseOrder{}
		err := rows.Scan(&po.ID, &po.SupplierID, &po.OrderDate, &po.Status, &po.TotalAmount, &po.CreatedAt, &po.UpdatedAt)
		if err != nil {
			return nil, err
		}
		purchaseOrders = append(purchaseOrders, po)
	}
	return purchaseOrders, rows.Err()
}

// Delete deletes a purchase order by its ID from the database.
func (r *PurchaseOrderRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM purchase_orders WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
