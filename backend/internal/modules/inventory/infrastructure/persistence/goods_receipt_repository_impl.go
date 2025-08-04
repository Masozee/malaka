package persistence

import (
	"context"
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// GoodsReceiptRepositoryImpl implements repositories.GoodsReceiptRepository.
type GoodsReceiptRepositoryImpl struct {
	db *sqlx.DB
}

// NewGoodsReceiptRepositoryImpl creates a new GoodsReceiptRepositoryImpl.
func NewGoodsReceiptRepositoryImpl(db *sqlx.DB) *GoodsReceiptRepositoryImpl {
	return &GoodsReceiptRepositoryImpl{db: db}
}

// Create creates a new goods receipt in the database.
func (r *GoodsReceiptRepositoryImpl) Create(ctx context.Context, gr *entities.GoodsReceipt) error {
	query := `INSERT INTO goods_receipts (id, purchase_order_id, receipt_date, warehouse_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, gr.ID, gr.PurchaseOrderID, gr.ReceiptDate, gr.WarehouseID, gr.CreatedAt, gr.UpdatedAt)
	return err
}

// GetByID retrieves a goods receipt by its ID from the database.
func (r *GoodsReceiptRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.GoodsReceipt, error) {
	query := `SELECT id, purchase_order_id, receipt_date, warehouse_id, created_at, updated_at FROM goods_receipts WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	gr := &entities.GoodsReceipt{}
	err := row.Scan(&gr.ID, &gr.PurchaseOrderID, &gr.ReceiptDate, &gr.WarehouseID, &gr.CreatedAt, &gr.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Goods receipt not found
	}
	return gr, err
}

// Update updates an existing goods receipt in the database.
func (r *GoodsReceiptRepositoryImpl) Update(ctx context.Context, gr *entities.GoodsReceipt) error {
	query := `UPDATE goods_receipts SET purchase_order_id = $1, receipt_date = $2, warehouse_id = $3, updated_at = $4 WHERE id = $5`
	_, err := r.db.ExecContext(ctx, query, gr.PurchaseOrderID, gr.ReceiptDate, gr.WarehouseID, gr.UpdatedAt, gr.ID)
	return err
}

// GetAll retrieves all goods receipts from the database.
func (r *GoodsReceiptRepositoryImpl) GetAll(ctx context.Context) ([]*entities.GoodsReceipt, error) {
	query := `SELECT id, purchase_order_id, receipt_date, warehouse_id, created_at, updated_at FROM goods_receipts ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var goodsReceipts []*entities.GoodsReceipt
	for rows.Next() {
		gr := &entities.GoodsReceipt{}
		err := rows.Scan(&gr.ID, &gr.PurchaseOrderID, &gr.ReceiptDate, &gr.WarehouseID, &gr.CreatedAt, &gr.UpdatedAt)
		if err != nil {
			return nil, err
		}
		goodsReceipts = append(goodsReceipts, gr)
	}
	return goodsReceipts, rows.Err()
}

// Delete deletes a goods receipt by its ID from the database.
func (r *GoodsReceiptRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM goods_receipts WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetAllWithDetails retrieves all goods receipts with related supplier, warehouse, and items information
func (r *GoodsReceiptRepositoryImpl) GetAllWithDetails(ctx context.Context) ([]map[string]interface{}, error) {
	query := `
		SELECT 
			gr.id,
			gr.purchase_order_id,
			gr.receipt_date,
			gr.warehouse_id,
			gr.created_at,
			gr.updated_at,
			s.name as supplier_name,
			w.name as warehouse_name,
			po.total_amount,
			po.status as po_status,
			COALESCE(item_counts.total_items, 0) as total_items,
			COALESCE(item_counts.total_quantity, 0) as total_quantity
		FROM goods_receipts gr
		JOIN purchase_orders po ON gr.purchase_order_id = po.id
		JOIN suppliers s ON po.supplier_id = s.id
		JOIN warehouses w ON gr.warehouse_id = w.id
		LEFT JOIN (
			SELECT 
				goods_receipt_id,
				COUNT(*) as total_items,
				SUM(quantity) as total_quantity
			FROM goods_receipt_items 
			GROUP BY goods_receipt_id
		) item_counts ON gr.id = item_counts.goods_receipt_id
		ORDER BY gr.receipt_date DESC
	`
	
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var (
			id, purchaseOrderID, warehouseID, supplierName, warehouseName, poStatus string
			receiptDate, createdAt, updatedAt time.Time
			totalAmount float64
			totalItems, totalQuantity int
		)
		
		err := rows.Scan(
			&id, &purchaseOrderID, &receiptDate, &warehouseID, &createdAt, &updatedAt,
			&supplierName, &warehouseName, &totalAmount, &poStatus, &totalItems, &totalQuantity,
		)
		if err != nil {
			return nil, err
		}

		// Determine status based on receipt date and PO status
		status := "pending"
		if receiptDate.Before(time.Now()) {
			if poStatus == "completed" {
				status = "completed"
			} else {
				status = "approved"
			}
		}

		result := map[string]interface{}{
			"id":              id,
			"purchase_order_id": purchaseOrderID,
			"receipt_date":    receiptDate,
			"warehouse_id":    warehouseID,
			"created_at":      createdAt,
			"updated_at":      updatedAt,
			"receiptNumber":   "GR-" + id[len(id)-8:],
			"supplierName":    supplierName,
			"poNumber":        purchaseOrderID[len(purchaseOrderID)-8:],
			"warehouse":       warehouseName,
			"status":          status,
			"totalAmount":     totalAmount,
			"totalItems":      totalItems,
			"items":          []interface{}{}, // Will be populated separately if needed
		}
		
		results = append(results, result)
	}
	
	return results, rows.Err()
}

// GetByIDWithDetails retrieves a goods receipt by ID with related information
func (r *GoodsReceiptRepositoryImpl) GetByIDWithDetails(ctx context.Context, id string) (map[string]interface{}, error) {
	query := `
		SELECT 
			gr.id,
			gr.purchase_order_id,
			gr.receipt_date,
			gr.warehouse_id,
			gr.created_at,
			gr.updated_at,
			s.name as supplier_name,
			w.name as warehouse_name,
			po.total_amount,
			po.status as po_status
		FROM goods_receipts gr
		JOIN purchase_orders po ON gr.purchase_order_id = po.id
		JOIN suppliers s ON po.supplier_id = s.id
		JOIN warehouses w ON gr.warehouse_id = w.id
		WHERE gr.id = $1
	`
	
	row := r.db.QueryRowContext(ctx, query, id)
	
	var (
		grID, purchaseOrderID, warehouseID, supplierName, warehouseName, poStatus string
		receiptDate, createdAt, updatedAt time.Time
		totalAmount float64
	)
	
	err := row.Scan(
		&grID, &purchaseOrderID, &receiptDate, &warehouseID, &createdAt, &updatedAt,
		&supplierName, &warehouseName, &totalAmount, &poStatus,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	// Get items for this receipt
	itemsQuery := `
		SELECT 
			gri.id,
			gri.quantity,
			a.name as product_name,
			COALESCE(a.barcode, 'N/A') as product_code,
			COALESCE(poi.unit_price, 0) as unit_price,
			COALESCE(poi.unit_price * gri.quantity, 0) as total_price
		FROM goods_receipt_items gri
		JOIN articles a ON gri.article_id = a.id
		LEFT JOIN purchase_order_items poi ON poi.purchase_order_id = $1 AND poi.article_id = gri.article_id
		WHERE gri.goods_receipt_id = $2
	`
	
	itemRows, err := r.db.QueryContext(ctx, itemsQuery, purchaseOrderID, id)
	if err != nil {
		return nil, err
	}
	defer itemRows.Close()

	var items []map[string]interface{}
	totalItems := 0
	for itemRows.Next() {
		var (
			itemID, productName, productCode string
			quantity int
			unitPrice, totalPrice float64
		)
		
		err := itemRows.Scan(&itemID, &quantity, &productName, &productCode, &unitPrice, &totalPrice)
		if err != nil {
			return nil, err
		}
		
		items = append(items, map[string]interface{}{
			"id":          itemID,
			"productCode": productCode,
			"productName": productName,
			"quantity":    quantity,
			"unitPrice":   unitPrice,
			"totalPrice":  totalPrice,
		})
		totalItems++
	}

	// Determine status
	status := "pending"
	if receiptDate.Before(time.Now()) {
		if poStatus == "completed" {
			status = "completed"
		} else {
			status = "approved"
		}
	}

	result := map[string]interface{}{
		"id":              grID,
		"purchase_order_id": purchaseOrderID,
		"receipt_date":    receiptDate,
		"warehouse_id":    warehouseID,
		"created_at":      createdAt,
		"updated_at":      updatedAt,
		"receiptNumber":   "GR-" + grID[len(grID)-8:],
		"supplierName":    supplierName,
		"poNumber":        purchaseOrderID[len(purchaseOrderID)-8:],
		"warehouse":       warehouseName,
		"status":          status,
		"totalAmount":     totalAmount,
		"totalItems":      totalItems,
		"items":          items,
	}
	
	return result, nil
}
