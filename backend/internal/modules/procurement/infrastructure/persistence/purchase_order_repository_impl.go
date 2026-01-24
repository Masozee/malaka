package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
)

// PurchaseOrderRepositoryImpl implements the PurchaseOrderRepository interface
type PurchaseOrderRepositoryImpl struct {
	db *sqlx.DB
}

// NewPurchaseOrderRepository creates a new purchase order repository
func NewPurchaseOrderRepository(db *sqlx.DB) repositories.PurchaseOrderRepository {
	return &PurchaseOrderRepositoryImpl{db: db}
}

// Create creates a new purchase order
func (r *PurchaseOrderRepositoryImpl) Create(ctx context.Context, order *entities.PurchaseOrder) error {
	query := `
		INSERT INTO procurement_purchase_orders (
			id, po_number, supplier_id, purchase_request_id, order_date,
			expected_delivery_date, delivery_address, payment_terms, currency,
			subtotal, discount_amount, tax_amount, shipping_cost, total_amount,
			status, payment_status, notes, created_by, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
		)
	`

	_, err := r.db.ExecContext(ctx, query,
		order.ID,
		order.PONumber,
		order.SupplierID,
		order.PurchaseRequestID,
		order.OrderDate,
		order.ExpectedDeliveryDate,
		order.DeliveryAddress,
		order.PaymentTerms,
		order.Currency,
		order.Subtotal,
		order.DiscountAmount,
		order.TaxAmount,
		order.ShippingCost,
		order.TotalAmount,
		order.Status,
		order.PaymentStatus,
		order.Notes,
		order.CreatedBy,
		order.CreatedAt,
		order.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create purchase order: %w", err)
	}

	// Insert items if any
	for _, item := range order.Items {
		if err := r.AddItem(ctx, &item); err != nil {
			return fmt.Errorf("failed to add item: %w", err)
		}
	}

	return nil
}

// GetByID retrieves a purchase order by ID
func (r *PurchaseOrderRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.PurchaseOrder, error) {
	query := `
		SELECT
			po.id, po.po_number, po.supplier_id, po.purchase_request_id, po.order_date,
			po.expected_delivery_date, po.delivery_address, po.payment_terms, po.currency,
			po.subtotal, po.discount_amount, po.tax_amount, po.shipping_cost, po.total_amount,
			po.status, po.payment_status, COALESCE(po.notes, '') as notes, po.created_by, po.approved_by, po.approved_at,
			po.sent_at, po.confirmed_at, po.received_at, po.cancelled_at, COALESCE(po.cancel_reason, '') as cancel_reason,
			po.created_at, po.updated_at,
			COALESCE(s.name, '') as supplier_name,
			COALESCE(e.employee_name, u.username, '') as created_by_name,
			COALESCE(e.position, 'Staff') as created_by_position
		FROM procurement_purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.id
		LEFT JOIN users u ON po.created_by = u.id
		LEFT JOIN employees e ON u.email = e.email
		WHERE po.id = $1
	`

	var order entities.PurchaseOrder
	err := r.db.GetContext(ctx, &order, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get purchase order: %w", err)
	}

	// Load items
	items, err := r.GetItemsByOrderID(ctx, id)
	if err != nil {
		return nil, err
	}
	for _, item := range items {
		order.Items = append(order.Items, *item)
	}

	return &order, nil
}

// GetByPONumber retrieves a purchase order by PO number
func (r *PurchaseOrderRepositoryImpl) GetByPONumber(ctx context.Context, poNumber string) (*entities.PurchaseOrder, error) {
	query := `
		SELECT
			po.id, po.po_number, po.supplier_id, po.purchase_request_id, po.order_date,
			po.expected_delivery_date, po.delivery_address, po.payment_terms, po.currency,
			po.subtotal, po.discount_amount, po.tax_amount, po.shipping_cost, po.total_amount,
			po.status, po.payment_status, COALESCE(po.notes, '') as notes, po.created_by, po.approved_by, po.approved_at,
			po.sent_at, po.confirmed_at, po.received_at, po.cancelled_at, COALESCE(po.cancel_reason, '') as cancel_reason,
			po.created_at, po.updated_at,
			COALESCE(s.name, '') as supplier_name,
			COALESCE(e.employee_name, u.username, '') as created_by_name,
			COALESCE(e.position, 'Staff') as created_by_position
		FROM procurement_purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.id
		LEFT JOIN users u ON po.created_by = u.id
		LEFT JOIN employees e ON u.email = e.email
		WHERE po.po_number = $1
	`

	var order entities.PurchaseOrder
	err := r.db.GetContext(ctx, &order, query, poNumber)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get purchase order: %w", err)
	}

	return &order, nil
}

// GetAll retrieves all purchase orders with optional filtering
func (r *PurchaseOrderRepositoryImpl) GetAll(ctx context.Context, filter repositories.PurchaseOrderFilter) (*repositories.PurchaseOrderListResult, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	baseQuery := `
		SELECT
			po.id, po.po_number, po.supplier_id, po.purchase_request_id, po.order_date,
			po.expected_delivery_date, po.delivery_address, po.payment_terms, po.currency,
			po.subtotal, po.discount_amount, po.tax_amount, po.shipping_cost, po.total_amount,
			po.status, po.payment_status, COALESCE(po.notes, '') as notes, po.created_by, po.approved_by, po.approved_at,
			po.sent_at, po.confirmed_at, po.received_at, po.cancelled_at, COALESCE(po.cancel_reason, '') as cancel_reason,
			po.created_at, po.updated_at,
			COALESCE(s.name, '') as supplier_name,
			COALESCE(e.employee_name, u.username, '') as created_by_name,
			COALESCE(e.position, 'Staff') as created_by_position
		FROM procurement_purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.id
		LEFT JOIN users u ON po.created_by = u.id
		LEFT JOIN employees e ON u.email = e.email
	`

	if filter.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(po.po_number ILIKE $%d OR s.name ILIKE $%d OR po.notes ILIKE $%d)", argIndex, argIndex, argIndex))
		args = append(args, "%"+filter.Search+"%")
		argIndex++
	}

	if filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("po.status = $%d", argIndex))
		args = append(args, filter.Status)
		argIndex++
	}

	if filter.PaymentStatus != "" {
		conditions = append(conditions, fmt.Sprintf("po.payment_status = $%d", argIndex))
		args = append(args, filter.PaymentStatus)
		argIndex++
	}

	if filter.SupplierID != "" {
		conditions = append(conditions, fmt.Sprintf("po.supplier_id = $%d", argIndex))
		args = append(args, filter.SupplierID)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = " WHERE " + strings.Join(conditions, " AND ")
	}

	// Count query
	countQuery := "SELECT COUNT(*) FROM procurement_purchase_orders po LEFT JOIN suppliers s ON po.supplier_id = s.id LEFT JOIN users u ON po.created_by = u.id LEFT JOIN employees e ON u.email = e.email" + whereClause
	var totalRows int64
	err := r.db.GetContext(ctx, &totalRows, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count purchase orders: %w", err)
	}

	// Sort
	sortBy := "po.created_at"
	if filter.SortBy != "" {
		sortBy = "po." + filter.SortBy
	}
	sortOrder := "DESC"
	if filter.SortOrder == "asc" {
		sortOrder = "ASC"
	}

	// Pagination
	page := filter.Page
	if page < 1 {
		page = 1
	}
	limit := filter.Limit
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := baseQuery + whereClause + fmt.Sprintf(" ORDER BY %s %s LIMIT %d OFFSET %d", sortBy, sortOrder, limit, offset)

	var orders []*entities.PurchaseOrder
	err = r.db.SelectContext(ctx, &orders, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get purchase orders: %w", err)
	}

	totalPages := int(totalRows) / limit
	if int(totalRows)%limit > 0 {
		totalPages++
	}

	return &repositories.PurchaseOrderListResult{
		Data:       orders,
		TotalRows:  totalRows,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// Update updates an existing purchase order
func (r *PurchaseOrderRepositoryImpl) Update(ctx context.Context, order *entities.PurchaseOrder) error {
	query := `
		UPDATE procurement_purchase_orders SET
			supplier_id = $2,
			purchase_request_id = $3,
			expected_delivery_date = $4,
			delivery_address = $5,
			payment_terms = $6,
			currency = $7,
			subtotal = $8,
			discount_amount = $9,
			tax_amount = $10,
			shipping_cost = $11,
			total_amount = $12,
			status = $13,
			payment_status = $14,
			notes = $15,
			approved_by = $16,
			approved_at = $17,
			sent_at = $18,
			confirmed_at = $19,
			received_at = $20,
			cancelled_at = $21,
			cancel_reason = $22,
			updated_at = $23
		WHERE id = $1
	`

	order.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		order.ID,
		order.SupplierID,
		order.PurchaseRequestID,
		order.ExpectedDeliveryDate,
		order.DeliveryAddress,
		order.PaymentTerms,
		order.Currency,
		order.Subtotal,
		order.DiscountAmount,
		order.TaxAmount,
		order.ShippingCost,
		order.TotalAmount,
		order.Status,
		order.PaymentStatus,
		order.Notes,
		order.ApprovedBy,
		order.ApprovedAt,
		order.SentAt,
		order.ConfirmedAt,
		order.ReceivedAt,
		order.CancelledAt,
		order.CancelReason,
		order.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update purchase order: %w", err)
	}

	return nil
}

// Delete deletes a purchase order
func (r *PurchaseOrderRepositoryImpl) Delete(ctx context.Context, id string) error {
	// Delete items first
	_, err := r.db.ExecContext(ctx, "DELETE FROM procurement_purchase_order_items WHERE purchase_order_id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete purchase order items: %w", err)
	}

	// Delete order
	_, err = r.db.ExecContext(ctx, "DELETE FROM procurement_purchase_orders WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete purchase order: %w", err)
	}

	return nil
}

// GetStats retrieves purchase order statistics
func (r *PurchaseOrderRepositoryImpl) GetStats(ctx context.Context) (*repositories.PurchaseOrderStats, error) {
	query := `
		SELECT
			COUNT(*) as total_orders,
			COALESCE(SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END), 0) as draft_orders,
			COALESCE(SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END), 0) as sent_orders,
			COALESCE(SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END), 0) as confirmed_orders,
			COALESCE(SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END), 0) as received_orders,
			COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled_orders,
			COALESCE(SUM(total_amount), 0) as total_value,
			COALESCE(SUM(CASE WHEN payment_status = 'unpaid' THEN total_amount ELSE 0 END), 0) as unpaid_value
		FROM procurement_purchase_orders
	`

	var stats repositories.PurchaseOrderStats
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get purchase order stats: %w", err)
	}

	return &stats, nil
}

// AddItem adds an item to a purchase order
func (r *PurchaseOrderRepositoryImpl) AddItem(ctx context.Context, item *entities.PurchaseOrderItem) error {
	query := `
		INSERT INTO procurement_purchase_order_items (
			id, purchase_order_id, item_name, description, specification,
			quantity, unit, unit_price, discount_percentage, tax_percentage,
			line_total, received_quantity, currency, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
		)
	`

	_, err := r.db.ExecContext(ctx, query,
		item.ID,
		item.PurchaseOrderID,
		item.ItemName,
		item.Description,
		item.Specification,
		item.Quantity,
		item.Unit,
		item.UnitPrice,
		item.DiscountPercentage,
		item.TaxPercentage,
		item.LineTotal,
		item.ReceivedQuantity,
		item.Currency,
		item.CreatedAt,
		item.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to add purchase order item: %w", err)
	}

	return nil
}

// UpdateItem updates an item in a purchase order
func (r *PurchaseOrderRepositoryImpl) UpdateItem(ctx context.Context, item *entities.PurchaseOrderItem) error {
	query := `
		UPDATE procurement_purchase_order_items SET
			item_name = $2,
			description = $3,
			specification = $4,
			quantity = $5,
			unit = $6,
			unit_price = $7,
			discount_percentage = $8,
			tax_percentage = $9,
			line_total = $10,
			received_quantity = $11,
			currency = $12,
			updated_at = $13
		WHERE id = $1
	`

	item.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		item.ID,
		item.ItemName,
		item.Description,
		item.Specification,
		item.Quantity,
		item.Unit,
		item.UnitPrice,
		item.DiscountPercentage,
		item.TaxPercentage,
		item.LineTotal,
		item.ReceivedQuantity,
		item.Currency,
		item.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update purchase order item: %w", err)
	}

	return nil
}

// DeleteItem deletes an item from a purchase order
func (r *PurchaseOrderRepositoryImpl) DeleteItem(ctx context.Context, orderID, itemID string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM procurement_purchase_order_items WHERE id = $1 AND purchase_order_id = $2", itemID, orderID)
	if err != nil {
		return fmt.Errorf("failed to delete purchase order item: %w", err)
	}

	return nil
}

// GetItemsByOrderID retrieves all items for a purchase order
func (r *PurchaseOrderRepositoryImpl) GetItemsByOrderID(ctx context.Context, orderID string) ([]*entities.PurchaseOrderItem, error) {
	query := `
		SELECT
			id, purchase_order_id, item_name, COALESCE(description, '') as description, COALESCE(specification, '') as specification,
			quantity, unit, unit_price, discount_percentage, tax_percentage,
			line_total, received_quantity, currency, created_at, updated_at
		FROM procurement_purchase_order_items
		WHERE purchase_order_id = $1
		ORDER BY created_at ASC
	`

	var items []*entities.PurchaseOrderItem
	err := r.db.SelectContext(ctx, &items, query, orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to get purchase order items: %w", err)
	}

	return items, nil
}

// GetNextPONumber generates the next PO number
func (r *PurchaseOrderRepositoryImpl) GetNextPONumber(ctx context.Context) (string, error) {
	today := time.Now().Format("20060102")
	prefix := "PO-" + today + "-"

	query := `
		SELECT COUNT(*) + 1 FROM procurement_purchase_orders
		WHERE po_number LIKE $1
	`

	var count int
	err := r.db.GetContext(ctx, &count, query, prefix+"%")
	if err != nil {
		return "", fmt.Errorf("failed to get next PO number: %w", err)
	}

	return fmt.Sprintf("%s%04d", prefix, count), nil
}
