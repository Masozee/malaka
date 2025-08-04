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

// GetByID retrieves a purchase order by its ID from the database with supplier and items information.
func (r *PurchaseOrderRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.PurchaseOrder, error) {
	query := `
		SELECT 
			po.id, po.supplier_id, po.order_date, po.status, po.total_amount, po.created_at, po.updated_at,
			s.id, s.name, s.contact, s.address
		FROM purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.id
		WHERE po.id = $1
	`
	
	row := r.db.QueryRowContext(ctx, query, id)

	po := &entities.PurchaseOrder{}
	supplier := &entities.Supplier{}
	
	var supplierID, supplierName, contact, address sql.NullString
	
	err := row.Scan(
		&po.ID, &po.SupplierID, &po.OrderDate, &po.Status, &po.TotalAmount, &po.CreatedAt, &po.UpdatedAt,
		&supplierID, &supplierName, &contact, &address,
	)
	if err == sql.ErrNoRows {
		return nil, nil // Purchase order not found
	}
	if err != nil {
		return nil, err
	}
	
	// Only populate supplier if it exists
	if supplierID.Valid {
		supplier.ID = supplierID.String
		supplier.Name = supplierName.String
		supplier.Code = "" // Not available in current schema
		supplier.ContactPerson = contact.String
		supplier.Phone = "" // Not available in current schema
		supplier.Email = "" // Not available in current schema
		supplier.Address = address.String
		po.Supplier = supplier
	}
	
	// Load items for the purchase order
	items, err := r.getPurchaseOrderItems(ctx, po.ID)
	if err != nil {
		return nil, err
	}
	po.Items = items
	
	return po, nil
}

// Update updates an existing purchase order in the database.
func (r *PurchaseOrderRepositoryImpl) Update(ctx context.Context, po *entities.PurchaseOrder) error {
	query := `UPDATE purchase_orders SET supplier_id = $1, order_date = $2, status = $3, total_amount = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, po.SupplierID, po.OrderDate, po.Status, po.TotalAmount, po.UpdatedAt, po.ID)
	return err
}

// GetAll retrieves all purchase orders from the database with supplier information.
func (r *PurchaseOrderRepositoryImpl) GetAll(ctx context.Context) ([]*entities.PurchaseOrder, error) {
	query := `
		SELECT 
			po.id, po.supplier_id, po.order_date, po.status, po.total_amount, po.created_at, po.updated_at,
			s.id, s.name, s.contact, s.address
		FROM purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.id
		ORDER BY po.order_date DESC
	`
	
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var purchaseOrders []*entities.PurchaseOrder
	for rows.Next() {
		po := &entities.PurchaseOrder{}
		supplier := &entities.Supplier{}
		
		var supplierID, supplierName, contact, address sql.NullString
		
		err := rows.Scan(
			&po.ID, &po.SupplierID, &po.OrderDate, &po.Status, &po.TotalAmount, &po.CreatedAt, &po.UpdatedAt,
			&supplierID, &supplierName, &contact, &address,
		)
		if err != nil {
			return nil, err
		}
		
		// Only populate supplier if it exists
		if supplierID.Valid {
			supplier.ID = supplierID.String
			supplier.Name = supplierName.String
			supplier.Code = "" // Not available in current schema
			supplier.ContactPerson = contact.String
			supplier.Phone = "" // Not available in current schema
			supplier.Email = "" // Not available in current schema
			supplier.Address = address.String
			po.Supplier = supplier
		}
		
		purchaseOrders = append(purchaseOrders, po)
	}
	
	// Load items for each purchase order
	for _, po := range purchaseOrders {
		items, err := r.getPurchaseOrderItems(ctx, po.ID)
		if err != nil {
			return nil, err
		}
		po.Items = items
	}
	
	return purchaseOrders, rows.Err()
}

// Delete deletes a purchase order by its ID from the database.
func (r *PurchaseOrderRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM purchase_orders WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// getPurchaseOrderItems retrieves items for a specific purchase order with article information.
func (r *PurchaseOrderRepositoryImpl) getPurchaseOrderItems(ctx context.Context, purchaseOrderID string) ([]*entities.PurchaseOrderItem, error) {
	query := `
		SELECT 
			poi.id, poi.purchase_order_id, poi.article_id, poi.quantity, poi.unit_price, poi.total_price,
			a.id, a.name, a.description
		FROM purchase_order_items poi
		LEFT JOIN articles a ON poi.article_id = a.id
		WHERE poi.purchase_order_id = $1
		ORDER BY poi.created_at ASC
	`
	
	rows, err := r.db.QueryContext(ctx, query, purchaseOrderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*entities.PurchaseOrderItem
	for rows.Next() {
		item := &entities.PurchaseOrderItem{}
		article := &entities.Article{}
		
		var articleID, articleName, articleDescription sql.NullString
		
		err := rows.Scan(
			&item.ID, &item.PurchaseOrderID, &item.ArticleID, &item.Quantity, &item.UnitPrice, &item.TotalPrice,
			&articleID, &articleName, &articleDescription,
		)
		if err != nil {
			return nil, err
		}
		
		// Only populate article if it exists
		if articleID.Valid {
			article.ID = articleID.String
			article.Code = "" // Not available in current schema
			article.Name = articleName.String
			article.Description = articleDescription.String
			item.Article = article
		}
		
		items = append(items, item)
	}
	
	return items, rows.Err()
}
