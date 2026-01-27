package integration

import (
	"context"
	"time"
)

// ProcurementType represents the type of procurement for accounting classification
type ProcurementType string

const (
	ProcurementTypeRawMaterial  ProcurementType = "RAW_MATERIAL"  // COGS
	ProcurementTypeOfficeSupply ProcurementType = "OFFICE_SUPPLY" // OPEX
	ProcurementTypeAsset        ProcurementType = "ASSET"         // Capitalize
	ProcurementTypeService      ProcurementType = "SERVICE"       // OPEX
)

// PurchaseOrderDTO is a read-only representation of a Purchase Order for cross-module integration.
// This allows Inventory module to read PO data without owning it.
type PurchaseOrderDTO struct {
	ID                   string          `json:"id"`
	PONumber             string          `json:"po_number"`
	SupplierID           string          `json:"supplier_id"`
	SupplierName         string          `json:"supplier_name"`
	PurchaseRequestID    *string         `json:"purchase_request_id,omitempty"`
	OrderDate            time.Time       `json:"order_date"`
	ExpectedDeliveryDate *time.Time      `json:"expected_delivery_date,omitempty"`
	DeliveryAddress      string          `json:"delivery_address"`
	PaymentTerms         string          `json:"payment_terms"`
	Currency             string          `json:"currency"`
	Subtotal             float64         `json:"subtotal"`
	DiscountAmount       float64         `json:"discount_amount"`
	TaxAmount            float64         `json:"tax_amount"`
	ShippingCost         float64         `json:"shipping_cost"`
	TotalAmount          float64         `json:"total_amount"`
	Status               string          `json:"status"`
	PaymentStatus        string          `json:"payment_status"`
	ProcurementType      ProcurementType `json:"procurement_type"`
	ExpenseAccountID     *string         `json:"expense_account_id,omitempty"`
	Notes                string          `json:"notes,omitempty"`
	CreatedBy            string          `json:"created_by"`
	ApprovedBy           *string         `json:"approved_by,omitempty"`
	ApprovedAt           *time.Time      `json:"approved_at,omitempty"`
	Items                []POItemDTO     `json:"items,omitempty"`
}

// POItemDTO is a read-only representation of a PO line item
type POItemDTO struct {
	ID               string  `json:"id"`
	PurchaseOrderID  string  `json:"purchase_order_id"`
	ItemName         string  `json:"item_name"`
	Description      string  `json:"description,omitempty"`
	Specification    string  `json:"specification,omitempty"`
	ArticleID        *string `json:"article_id,omitempty"` // Reference to master data article
	Quantity         int     `json:"quantity"`
	Unit             string  `json:"unit"`
	UnitPrice        float64 `json:"unit_price"`
	LineTotal        float64 `json:"line_total"`
	ReceivedQuantity int     `json:"received_quantity"`
}

// ProcurementReader provides read-only access to Procurement data for other modules.
// Inventory module should use this interface to access PO data instead of owning PO entities.
type ProcurementReader interface {
	// GetPurchaseOrderByID retrieves a purchase order by ID
	GetPurchaseOrderByID(ctx context.Context, id string) (*PurchaseOrderDTO, error)

	// GetPurchaseOrderByPONumber retrieves a purchase order by PO number
	GetPurchaseOrderByPONumber(ctx context.Context, poNumber string) (*PurchaseOrderDTO, error)

	// GetApprovedPurchaseOrders retrieves all approved POs pending receipt
	GetApprovedPurchaseOrders(ctx context.Context) ([]*PurchaseOrderDTO, error)

	// GetPurchaseOrdersBySupplier retrieves POs for a specific supplier
	GetPurchaseOrdersBySupplier(ctx context.Context, supplierID string) ([]*PurchaseOrderDTO, error)

	// GetPurchaseOrderItems retrieves items for a specific PO
	GetPurchaseOrderItems(ctx context.Context, poID string) ([]POItemDTO, error)
}

// ProcurementNotifier allows other modules to notify Procurement of events.
// For example, Inventory notifies Procurement when goods are received.
type ProcurementNotifier interface {
	// NotifyGoodsReceived notifies Procurement that goods have been received for a PO
	NotifyGoodsReceived(ctx context.Context, notification *GoodsReceivedNotification) error

	// NotifyPartialReceipt notifies Procurement of partial receipt
	NotifyPartialReceipt(ctx context.Context, notification *PartialReceiptNotification) error
}

// GoodsReceivedNotification represents a notification that goods have been received
type GoodsReceivedNotification struct {
	PurchaseOrderID string    `json:"purchase_order_id"`
	GoodsReceiptID  string    `json:"goods_receipt_id"`
	WarehouseID     string    `json:"warehouse_id"`
	ReceivedDate    time.Time `json:"received_date"`
	ReceivedBy      string    `json:"received_by"`
	TotalReceived   float64   `json:"total_received"`
	IsComplete      bool      `json:"is_complete"` // True if all items fully received
}

// PartialReceiptNotification represents a partial goods receipt
type PartialReceiptNotification struct {
	PurchaseOrderID string                  `json:"purchase_order_id"`
	GoodsReceiptID  string                  `json:"goods_receipt_id"`
	Items           []PartialReceiptItemDTO `json:"items"`
}

// PartialReceiptItemDTO represents a partially received item
type PartialReceiptItemDTO struct {
	POItemID         string `json:"po_item_id"`
	ReceivedQuantity int    `json:"received_quantity"`
	RemainingQty     int    `json:"remaining_qty"`
}
