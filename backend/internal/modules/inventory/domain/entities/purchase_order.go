package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// DEPRECATED: PurchaseOrder in the Inventory module is deprecated.
// All Purchase Order operations should use the Procurement module's PurchaseOrder entity.
// This entity remains for backwards compatibility with existing Goods Receipt flows.
//
// Migration path:
// 1. Inventory should use integration.ProcurementReader to access PO data
// 2. GoodsReceipt.PurchaseOrderID should reference procurement_purchase_orders
// 3. This entity will be removed in a future version
//
// See: malaka/internal/shared/integration/procurement_integration.go
//
// PurchaseOrder represents a purchase order entity.
type PurchaseOrder struct {
	types.BaseModel
	SupplierID  uuid.ID   `json:"supplier_id" db:"supplier_id"`
	OrderDate   time.Time `json:"order_date" db:"order_date"`
	Status      string    `json:"status" db:"status"`
	TotalAmount float64   `json:"total_amount" db:"total_amount"`

	// Related data for API responses
	Supplier *Supplier            `json:"supplier,omitempty"`
	Items    []*PurchaseOrderItem `json:"items,omitempty"`
}

// Supplier represents basic supplier information for purchase orders
type Supplier struct {
	ID            uuid.ID `json:"id" db:"id"`
	Name          string  `json:"name" db:"name"`
	Code          string  `json:"code" db:"code"`
	ContactPerson string  `json:"contact_person" db:"contact_person"`
	Phone         string  `json:"phone" db:"phone"`
	Email         string  `json:"email" db:"email"`
	Address       string  `json:"address" db:"address"`
}

// PurchaseOrderItem represents an item in a purchase order
type PurchaseOrderItem struct {
	types.BaseModel
	PurchaseOrderID uuid.ID `json:"purchase_order_id" db:"purchase_order_id"`
	ArticleID       uuid.ID `json:"article_id" db:"article_id"`
	Quantity        int     `json:"quantity" db:"quantity"`
	UnitPrice       float64 `json:"unit_price" db:"unit_price"`
	TotalPrice      float64 `json:"total_price" db:"total_price"`

	// Related data for API responses
	Article *Article `json:"article,omitempty"`
}

// Article represents basic article information for purchase order items
type Article struct {
	ID          uuid.ID `json:"id" db:"id"`
	Code        string  `json:"code" db:"code"`
	Name        string  `json:"name" db:"name"`
	Description string  `json:"description" db:"description"`
}
