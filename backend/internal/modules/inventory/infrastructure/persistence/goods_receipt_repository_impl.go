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
	query := `INSERT INTO goods_receipts (
		id, purchase_order_id, receipt_date, warehouse_id,
		gr_number, status, supplier_id, supplier_name, total_amount,
		currency, procurement_type, notes, received_by,
		po_number, warehouse_name, payment_terms,
		created_at, updated_at
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`

	status := gr.Status
	if status == "" {
		status = entities.GoodsReceiptStatusDraft
	}

	// Convert empty strings to nil for nullable UUID fields
	var purchaseOrderID, supplierID, receivedBy interface{}
	if gr.PurchaseOrderID != "" {
		purchaseOrderID = gr.PurchaseOrderID
	}
	if gr.SupplierID != "" {
		supplierID = gr.SupplierID
	}
	if gr.ReceivedBy != "" {
		receivedBy = gr.ReceivedBy
	}

	_, err := r.db.ExecContext(ctx, query,
		gr.ID, purchaseOrderID, gr.ReceiptDate, gr.WarehouseID,
		gr.GRNumber, status, supplierID, gr.SupplierName, gr.TotalAmount,
		gr.Currency, gr.ProcurementType, gr.Notes, receivedBy,
		gr.PONumber, gr.WarehouseName, gr.PaymentTerms,
		gr.CreatedAt, gr.UpdatedAt)
	return err
}

// GetByID retrieves a goods receipt by its ID from the database.
func (r *GoodsReceiptRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.GoodsReceipt, error) {
	query := `SELECT
		id, purchase_order_id, receipt_date, warehouse_id,
		COALESCE(gr_number, '') as gr_number,
		COALESCE(status, 'DRAFT') as status,
		COALESCE(supplier_id::text, '') as supplier_id,
		COALESCE(supplier_name, '') as supplier_name,
		COALESCE(total_amount, 0) as total_amount,
		COALESCE(currency, 'IDR') as currency,
		COALESCE(procurement_type, 'RAW_MATERIAL') as procurement_type,
		COALESCE(notes, '') as notes,
		received_by,
		posted_at, posted_by,
		COALESCE(ap_created, false) as ap_created,
		ap_id, journal_entry_id,
		created_at, updated_at
	FROM goods_receipts WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	gr := &entities.GoodsReceipt{}
	var receivedBy, postedBy, apID, journalEntryID sql.NullString
	var postedAt sql.NullTime
	var status, procurementType string

	err := row.Scan(
		&gr.ID, &gr.PurchaseOrderID, &gr.ReceiptDate, &gr.WarehouseID,
		&gr.GRNumber, &status, &gr.SupplierID, &gr.SupplierName, &gr.TotalAmount,
		&gr.Currency, &procurementType, &gr.Notes, &receivedBy,
		&postedAt, &postedBy, &gr.APCreated, &apID, &journalEntryID,
		&gr.CreatedAt, &gr.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, nil // Goods receipt not found
	}
	if err != nil {
		return nil, err
	}

	gr.Status = entities.GoodsReceiptStatus(status)
	gr.ProcurementType = entities.ProcurementType(procurementType)

	if receivedBy.Valid {
		gr.ReceivedBy = receivedBy.String
	}
	if postedAt.Valid {
		gr.PostedAt = &postedAt.Time
	}
	if postedBy.Valid {
		gr.PostedBy = &postedBy.String
	}
	if apID.Valid {
		gr.APID = &apID.String
	}
	if journalEntryID.Valid {
		gr.JournalEntryID = &journalEntryID.String
	}

	return gr, nil
}

// Update updates an existing goods receipt in the database.
func (r *GoodsReceiptRepositoryImpl) Update(ctx context.Context, gr *entities.GoodsReceipt) error {
	query := `UPDATE goods_receipts SET
		purchase_order_id = $1, receipt_date = $2, warehouse_id = $3,
		gr_number = $4, status = $5, supplier_id = $6, supplier_name = $7,
		total_amount = $8, currency = $9, procurement_type = $10, notes = $11,
		received_by = $12, posted_at = $13, posted_by = $14,
		ap_created = $15, ap_id = $16, journal_entry_id = $17,
		updated_at = $18
	WHERE id = $19`

	gr.UpdatedAt = time.Now()

	// Convert empty strings to nil for nullable UUID fields
	var purchaseOrderID, supplierID, receivedBy interface{}
	if gr.PurchaseOrderID != "" {
		purchaseOrderID = gr.PurchaseOrderID
	}
	if gr.SupplierID != "" {
		supplierID = gr.SupplierID
	}
	if gr.ReceivedBy != "" {
		receivedBy = gr.ReceivedBy
	}
	var postedBy interface{}
	if gr.PostedBy != nil && *gr.PostedBy != "" {
		postedBy = *gr.PostedBy
	}

	_, err := r.db.ExecContext(ctx, query,
		purchaseOrderID, gr.ReceiptDate, gr.WarehouseID,
		gr.GRNumber, gr.Status, supplierID, gr.SupplierName,
		gr.TotalAmount, gr.Currency, gr.ProcurementType, gr.Notes,
		receivedBy, gr.PostedAt, postedBy,
		gr.APCreated, gr.APID, gr.JournalEntryID,
		gr.UpdatedAt, gr.ID)
	return err
}

// GetAll retrieves all goods receipts from the database.
func (r *GoodsReceiptRepositoryImpl) GetAll(ctx context.Context) ([]*entities.GoodsReceipt, error) {
	query := `SELECT id, purchase_order_id, receipt_date, warehouse_id, created_at, updated_at FROM goods_receipts ORDER BY receipt_date DESC, created_at DESC`
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
			COALESCE(gr.purchase_order_id::text, '') as purchase_order_id,
			gr.receipt_date,
			gr.warehouse_id,
			gr.created_at,
			gr.updated_at,
			COALESCE(gr.gr_number, 'GR-' || RIGHT(gr.id::text, 8)) as gr_number,
			COALESCE(gr.supplier_name, '') as supplier_name,
			COALESCE(gr.warehouse_name, w.name, '') as warehouse_name,
			COALESCE(gr.total_amount, 0) as total_amount,
			COALESCE(gr.status, 'DRAFT') as status,
			COALESCE(gr.po_number, '') as po_number,
			COALESCE(gr.currency, 'IDR') as currency,
			COALESCE(item_counts.total_items, 0) as total_items,
			COALESCE(item_counts.total_quantity, 0) as total_quantity
		FROM goods_receipts gr
		LEFT JOIN warehouses w ON gr.warehouse_id = w.id
		LEFT JOIN (
			SELECT
				goods_receipt_id,
				COUNT(*) as total_items,
				SUM(quantity) as total_quantity
			FROM goods_receipt_items
			GROUP BY goods_receipt_id
		) item_counts ON gr.id = item_counts.goods_receipt_id
		ORDER BY gr.receipt_date DESC, gr.created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var (
			id, purchaseOrderID, warehouseID, grNumber, supplierName, warehouseName, status, poNumber, currency string
			receiptDate, createdAt, updatedAt                                                                   time.Time
			totalAmount                                                                                         float64
			totalItems, totalQuantity                                                                           int
		)

		err := rows.Scan(
			&id, &purchaseOrderID, &receiptDate, &warehouseID, &createdAt, &updatedAt,
			&grNumber, &supplierName, &warehouseName, &totalAmount, &status, &poNumber, &currency,
			&totalItems, &totalQuantity,
		)
		if err != nil {
			return nil, err
		}

		result := map[string]interface{}{
			"id":                id,
			"purchase_order_id": purchaseOrderID,
			"receipt_date":      receiptDate,
			"warehouse_id":      warehouseID,
			"created_at":        createdAt,
			"updated_at":        updatedAt,
			"receiptNumber":     grNumber,
			"gr_number":         grNumber,
			"supplierName":      supplierName,
			"poNumber":          poNumber,
			"warehouse":         warehouseName,
			"status":            status,
			"totalAmount":       totalAmount,
			"currency":          currency,
			"totalItems":        totalItems,
			"items":             []interface{}{},
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
			COALESCE(gr.purchase_order_id::text, '') as purchase_order_id,
			gr.receipt_date,
			gr.warehouse_id,
			gr.created_at,
			gr.updated_at,
			COALESCE(gr.gr_number, 'GR-' || RIGHT(gr.id::text, 8)) as gr_number,
			COALESCE(gr.supplier_name, '') as supplier_name,
			COALESCE(gr.warehouse_name, w.name, '') as warehouse_name,
			COALESCE(gr.total_amount, 0) as total_amount,
			COALESCE(gr.status, 'DRAFT') as status,
			COALESCE(gr.po_number, '') as po_number,
			COALESCE(gr.currency, 'IDR') as currency,
			COALESCE(gr.procurement_type, 'RAW_MATERIAL') as procurement_type,
			COALESCE(gr.notes, '') as notes,
			gr.posted_at,
			gr.journal_entry_id
		FROM goods_receipts gr
		LEFT JOIN warehouses w ON gr.warehouse_id = w.id
		WHERE gr.id = $1
	`

	row := r.db.QueryRowContext(ctx, query, id)

	var (
		grID, purchaseOrderID, warehouseID, grNumber, supplierName, warehouseName string
		status, poNumber, currency, procurementType, notes                        string
		receiptDate, createdAt, updatedAt                                         time.Time
		totalAmount                                                               float64
		postedAt                                                                  sql.NullTime
		journalEntryID                                                            sql.NullString
	)

	err := row.Scan(
		&grID, &purchaseOrderID, &receiptDate, &warehouseID, &createdAt, &updatedAt,
		&grNumber, &supplierName, &warehouseName, &totalAmount, &status, &poNumber, &currency,
		&procurementType, &notes, &postedAt, &journalEntryID,
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
			COALESCE(gri.item_name, COALESCE(a.name, 'Unknown')) as product_name,
			COALESCE(a.barcode, 'N/A') as product_code,
			COALESCE(gri.unit_price, 0) as unit_price,
			COALESCE(gri.line_total, gri.unit_price * gri.quantity, 0) as total_price,
			COALESCE(gri.unit, 'pcs') as unit
		FROM goods_receipt_items gri
		LEFT JOIN articles a ON gri.article_id = a.id
		WHERE gri.goods_receipt_id = $1
	`

	itemRows, err := r.db.QueryContext(ctx, itemsQuery, id)
	if err != nil {
		return nil, err
	}
	defer itemRows.Close()

	var items []map[string]interface{}
	totalItems := 0
	for itemRows.Next() {
		var (
			itemID, productName, productCode, unit string
			quantity                               int
			unitPrice, totalPrice                  float64
		)

		err := itemRows.Scan(&itemID, &quantity, &productName, &productCode, &unitPrice, &totalPrice, &unit)
		if err != nil {
			return nil, err
		}

		items = append(items, map[string]interface{}{
			"id":          itemID,
			"productCode": productCode,
			"productName": productName,
			"quantity":     quantity,
			"unitPrice":    unitPrice,
			"totalPrice":   totalPrice,
			"unit":         unit,
		})
		totalItems++
	}

	result := map[string]interface{}{
		"id":                id,
		"purchase_order_id": purchaseOrderID,
		"receipt_date":      receiptDate,
		"warehouse_id":      warehouseID,
		"created_at":        createdAt,
		"updated_at":        updatedAt,
		"receiptNumber":     grNumber,
		"gr_number":         grNumber,
		"supplierName":      supplierName,
		"poNumber":          poNumber,
		"warehouse":         warehouseName,
		"status":            status,
		"totalAmount":       totalAmount,
		"currency":          currency,
		"procurementType":   procurementType,
		"notes":             notes,
		"totalItems":        totalItems,
		"items":             items,
	}

	if postedAt.Valid {
		result["posted_at"] = postedAt.Time
	}
	if journalEntryID.Valid {
		result["journal_entry_id"] = journalEntryID.String
	}

	return result, nil
}
