package integration

import (
	"context"
	"time"
)

// GoodsReceiptDTO is a read-only representation of a Goods Receipt for cross-module integration.
// Finance module uses this to create AP entries.
type GoodsReceiptDTO struct {
	ID              string              `json:"id"`
	GRNumber        string              `json:"gr_number"`
	PurchaseOrderID string              `json:"purchase_order_id"`
	PONumber        string              `json:"po_number"`
	SupplierID      string              `json:"supplier_id"`
	SupplierName    string              `json:"supplier_name"`
	WarehouseID     string              `json:"warehouse_id"`
	WarehouseName   string              `json:"warehouse_name"`
	ReceiptDate     time.Time           `json:"receipt_date"`
	Status          string              `json:"status"` // DRAFT, POSTED, CANCELLED
	TotalAmount     float64             `json:"total_amount"`
	Currency        string              `json:"currency"`
	ProcurementType ProcurementType     `json:"procurement_type"` // From PO
	Notes           string              `json:"notes,omitempty"`
	ReceivedBy      string              `json:"received_by"`
	PostedAt        *time.Time          `json:"posted_at,omitempty"`
	Items           []GoodsReceiptItemDTO `json:"items,omitempty"`
}

// GoodsReceiptItemDTO represents a line item in a goods receipt
type GoodsReceiptItemDTO struct {
	ID               string  `json:"id"`
	GoodsReceiptID   string  `json:"goods_receipt_id"`
	POItemID         string  `json:"po_item_id"`
	ArticleID        *string `json:"article_id,omitempty"`
	ItemName         string  `json:"item_name"`
	Quantity         int     `json:"quantity"`
	Unit             string  `json:"unit"`
	UnitPrice        float64 `json:"unit_price"`
	LineTotal        float64 `json:"line_total"`
}

// InventoryReader provides read-only access to Inventory data for Finance module.
// Finance uses this to access GR data for AP creation.
type InventoryReader interface {
	// GetGoodsReceiptByID retrieves a goods receipt by ID
	GetGoodsReceiptByID(ctx context.Context, id string) (*GoodsReceiptDTO, error)

	// GetGoodsReceiptByGRNumber retrieves a goods receipt by GR number
	GetGoodsReceiptByGRNumber(ctx context.Context, grNumber string) (*GoodsReceiptDTO, error)

	// GetPostedGoodsReceipts retrieves all posted GRs pending AP creation
	GetPostedGoodsReceiptsPendingAP(ctx context.Context) ([]*GoodsReceiptDTO, error)

	// GetGoodsReceiptsByPO retrieves all GRs for a specific PO
	GetGoodsReceiptsByPO(ctx context.Context, poID string) ([]*GoodsReceiptDTO, error)

	// GetGoodsReceiptsByDateRange retrieves GRs within a date range
	GetGoodsReceiptsByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*GoodsReceiptDTO, error)
}

// InventoryNotifier allows other modules to notify Inventory of events.
type InventoryNotifier interface {
	// NotifyAPCreated notifies Inventory that AP has been created for a GR
	NotifyAPCreated(ctx context.Context, notification *APCreatedNotification) error

	// NotifyPOCancelled notifies Inventory that a PO has been cancelled
	NotifyPOCancelled(ctx context.Context, notification *POCancelledNotification) error
}

// APCreatedNotification represents notification that AP was created for a GR
type APCreatedNotification struct {
	GoodsReceiptID string    `json:"goods_receipt_id"`
	APID           string    `json:"ap_id"`
	APNumber       string    `json:"ap_number"`
	Amount         float64   `json:"amount"`
	DueDate        time.Time `json:"due_date"`
	CreatedAt      time.Time `json:"created_at"`
}

// POCancelledNotification represents notification that a PO was cancelled
type POCancelledNotification struct {
	PurchaseOrderID string    `json:"purchase_order_id"`
	PONumber        string    `json:"po_number"`
	CancelledAt     time.Time `json:"cancelled_at"`
	CancelledBy     string    `json:"cancelled_by"`
	Reason          string    `json:"reason"`
}

// StockMovementDTO represents a stock movement for cross-module reporting
type StockMovementDTO struct {
	ID            string    `json:"id"`
	ArticleID     string    `json:"article_id"`
	WarehouseID   string    `json:"warehouse_id"`
	MovementType  string    `json:"movement_type"` // IN, OUT, TRANSFER, ADJUSTMENT
	Quantity      int       `json:"quantity"`
	UnitCost      float64   `json:"unit_cost"`
	TotalCost     float64   `json:"total_cost"`
	ReferenceType string    `json:"reference_type"` // GR, GI, SO, TRANSFER, ADJUSTMENT
	ReferenceID   string    `json:"reference_id"`
	MovementDate  time.Time `json:"movement_date"`
}

// InventoryValuationReader provides inventory valuation data for accounting
type InventoryValuationReader interface {
	// GetInventoryValuation gets total inventory value
	GetInventoryValuation(ctx context.Context) (*InventoryValuationDTO, error)

	// GetInventoryValuationByWarehouse gets valuation for a specific warehouse
	GetInventoryValuationByWarehouse(ctx context.Context, warehouseID string) (*InventoryValuationDTO, error)

	// GetStockMovementsForPeriod gets stock movements for GL reconciliation
	GetStockMovementsForPeriod(ctx context.Context, startDate, endDate time.Time) ([]*StockMovementDTO, error)
}

// InventoryValuationDTO represents inventory valuation for accounting
type InventoryValuationDTO struct {
	AsOfDate        time.Time                   `json:"as_of_date"`
	TotalValue      float64                     `json:"total_value"`
	TotalItems      int                         `json:"total_items"`
	ByWarehouse     []WarehouseValuationDTO     `json:"by_warehouse,omitempty"`
	ByCategory      []CategoryValuationDTO      `json:"by_category,omitempty"`
}

// WarehouseValuationDTO represents valuation per warehouse
type WarehouseValuationDTO struct {
	WarehouseID   string  `json:"warehouse_id"`
	WarehouseName string  `json:"warehouse_name"`
	TotalValue    float64 `json:"total_value"`
	ItemCount     int     `json:"item_count"`
}

// CategoryValuationDTO represents valuation per category
type CategoryValuationDTO struct {
	CategoryID   string  `json:"category_id"`
	CategoryName string  `json:"category_name"`
	TotalValue   float64 `json:"total_value"`
	ItemCount    int     `json:"item_count"`
}
