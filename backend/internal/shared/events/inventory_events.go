package events

import (
	"time"

	"malaka/internal/shared/integration"
)

// Event type constants for Inventory module
const (
	// Goods Receipt events
	EventTypeGRCreated  = "inventory.gr_created"
	EventTypeGRPosted   = "inventory.gr_posted"
	EventTypeGRCancelled = "inventory.gr_cancelled"

	// Stock Movement events
	EventTypeStockIn         = "inventory.stock_in"
	EventTypeStockOut        = "inventory.stock_out"
	EventTypeStockTransfer   = "inventory.stock_transfer"
	EventTypeStockAdjustment = "inventory.stock_adjustment"

	// Stock Opname events
	EventTypeOpnameStarted   = "inventory.opname_started"
	EventTypeOpnameCompleted = "inventory.opname_completed"
)

// GoodsReceiptPostedEvent is emitted when a GR is posted
// Subscribers: Finance (create AP), Accounting (auto-journal for inventory)
type GoodsReceiptPostedEvent struct {
	BaseEvent
	GoodsReceiptID  string                      `json:"goods_receipt_id"`
	GRNumber        string                      `json:"gr_number"`
	PurchaseOrderID string                      `json:"purchase_order_id"`
	PONumber        string                      `json:"po_number"`
	SupplierID      string                      `json:"supplier_id"`
	SupplierName    string                      `json:"supplier_name"`
	WarehouseID     string                      `json:"warehouse_id"`
	WarehouseName   string                      `json:"warehouse_name"`
	ReceiptDate     time.Time                   `json:"receipt_date"`
	TotalAmount     float64                     `json:"total_amount"`
	Currency        string                      `json:"currency"`
	ProcurementType integration.ProcurementType `json:"procurement_type"`
	PaymentTerms    string                      `json:"payment_terms"`
	PostedBy        string                      `json:"posted_by"`
	Items           []GRItemEventData           `json:"items"`
}

// GRItemEventData represents GR item data in events
type GRItemEventData struct {
	ItemID        string  `json:"item_id"`
	POItemID      string  `json:"po_item_id"`
	ArticleID     *string `json:"article_id,omitempty"`
	ItemName      string  `json:"item_name"`
	Quantity      int     `json:"quantity"`
	Unit          string  `json:"unit"`
	UnitPrice     float64 `json:"unit_price"`
	LineTotal     float64 `json:"line_total"`
}

// NewGoodsReceiptPostedEvent creates a new GR posted event
func NewGoodsReceiptPostedEvent(grID, grNumber, poID, poNumber, supplierID, supplierName, warehouseID, warehouseName string, receiptDate time.Time, totalAmount float64, currency string, procType integration.ProcurementType, paymentTerms, postedBy string, items []GRItemEventData) *GoodsReceiptPostedEvent {
	return &GoodsReceiptPostedEvent{
		BaseEvent:       NewBaseEvent(EventTypeGRPosted, grID, "GoodsReceipt"),
		GoodsReceiptID:  grID,
		GRNumber:        grNumber,
		PurchaseOrderID: poID,
		PONumber:        poNumber,
		SupplierID:      supplierID,
		SupplierName:    supplierName,
		WarehouseID:     warehouseID,
		WarehouseName:   warehouseName,
		ReceiptDate:     receiptDate,
		TotalAmount:     totalAmount,
		Currency:        currency,
		ProcurementType: procType,
		PaymentTerms:    paymentTerms,
		PostedBy:        postedBy,
		Items:           items,
	}
}

// GoodsReceiptCancelledEvent is emitted when a GR is cancelled
// Subscribers: Finance (cancel AP if created), Accounting (reverse journal)
type GoodsReceiptCancelledEvent struct {
	BaseEvent
	GoodsReceiptID  string    `json:"goods_receipt_id"`
	GRNumber        string    `json:"gr_number"`
	PurchaseOrderID string    `json:"purchase_order_id"`
	Reason          string    `json:"reason"`
	CancelledBy     string    `json:"cancelled_by"`
	CancelledAt     time.Time `json:"cancelled_at"`
}

// NewGoodsReceiptCancelledEvent creates a new GR cancelled event
func NewGoodsReceiptCancelledEvent(grID, grNumber, poID, reason, cancelledBy string) *GoodsReceiptCancelledEvent {
	return &GoodsReceiptCancelledEvent{
		BaseEvent:       NewBaseEvent(EventTypeGRCancelled, grID, "GoodsReceipt"),
		GoodsReceiptID:  grID,
		GRNumber:        grNumber,
		PurchaseOrderID: poID,
		Reason:          reason,
		CancelledBy:     cancelledBy,
		CancelledAt:     time.Now(),
	}
}

// StockMovementEvent is emitted when stock moves
// Subscribers: Accounting (auto-journal for COGS)
type StockMovementEvent struct {
	BaseEvent
	MovementID    string    `json:"movement_id"`
	ArticleID     string    `json:"article_id"`
	ArticleName   string    `json:"article_name"`
	WarehouseID   string    `json:"warehouse_id"`
	WarehouseName string    `json:"warehouse_name"`
	MovementType  string    `json:"movement_type"` // IN, OUT, TRANSFER, ADJUSTMENT
	Quantity      int       `json:"quantity"`
	UnitCost      float64   `json:"unit_cost"`
	TotalCost     float64   `json:"total_cost"`
	ReferenceType string    `json:"reference_type"` // GR, GI, SO, TRANSFER, ADJUSTMENT
	ReferenceID   string    `json:"reference_id"`
	MovementDate  time.Time `json:"movement_date"`
	MovedBy       string    `json:"moved_by"`
}

// NewStockMovementEvent creates a new stock movement event
func NewStockMovementEvent(movementID, articleID, articleName, warehouseID, warehouseName, movementType string, quantity int, unitCost, totalCost float64, refType, refID, movedBy string) *StockMovementEvent {
	return &StockMovementEvent{
		BaseEvent:     NewBaseEvent(EventTypeStockIn, movementID, "StockMovement"),
		MovementID:    movementID,
		ArticleID:     articleID,
		ArticleName:   articleName,
		WarehouseID:   warehouseID,
		WarehouseName: warehouseName,
		MovementType:  movementType,
		Quantity:      quantity,
		UnitCost:      unitCost,
		TotalCost:     totalCost,
		ReferenceType: refType,
		ReferenceID:   refID,
		MovementDate:  time.Now(),
		MovedBy:       movedBy,
	}
}
