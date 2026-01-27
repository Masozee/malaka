package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// GoodsReceiptStatus represents the status of a goods receipt
type GoodsReceiptStatus string

const (
	GoodsReceiptStatusDraft     GoodsReceiptStatus = "DRAFT"
	GoodsReceiptStatusPosted    GoodsReceiptStatus = "POSTED"
	GoodsReceiptStatusCancelled GoodsReceiptStatus = "CANCELLED"
)

// ProcurementType mirrors the procurement type from Procurement module
// Used for determining accounting treatment when creating AP
type ProcurementType string

const (
	ProcurementTypeRawMaterial  ProcurementType = "RAW_MATERIAL"  // COGS
	ProcurementTypeOfficeSupply ProcurementType = "OFFICE_SUPPLY" // OPEX
	ProcurementTypeAsset        ProcurementType = "ASSET"         // Capitalize
	ProcurementTypeService      ProcurementType = "SERVICE"       // OPEX
)

// GoodsReceipt represents a goods receipt entity.
// NOTE: PurchaseOrderID references procurement_purchase_orders table (Procurement module)
// NOT the deprecated purchase_orders table in Inventory module.
type GoodsReceipt struct {
	types.BaseModel

	// GRNumber is the unique goods receipt number
	GRNumber string `json:"gr_number" db:"gr_number"`

	// PurchaseOrderID references the Purchase Order from Procurement module
	// This is a foreign key to procurement_purchase_orders.id
	PurchaseOrderID string `json:"purchase_order_id" db:"purchase_order_id"`

	// PONumber is denormalized from PO for display/reporting
	PONumber string `json:"po_number" db:"po_number"`

	// SupplierID is denormalized from PO for display/reporting
	SupplierID string `json:"supplier_id" db:"supplier_id"`

	// SupplierName is denormalized from PO for display/reporting
	SupplierName string `json:"supplier_name" db:"supplier_name"`

	// WarehouseID is where the goods are received
	WarehouseID string `json:"warehouse_id" db:"warehouse_id"`

	// WarehouseName is denormalized for display
	WarehouseName string `json:"warehouse_name" db:"warehouse_name"`

	// ReceiptDate is when the goods were received
	ReceiptDate time.Time `json:"receipt_date" db:"receipt_date"`

	// Status of the goods receipt
	Status GoodsReceiptStatus `json:"status" db:"status"`

	// TotalAmount is the total value of received goods
	TotalAmount float64 `json:"total_amount" db:"total_amount"`

	// Currency from the PO
	Currency string `json:"currency" db:"currency"`

	// ProcurementType determines accounting treatment (from PO)
	// RAW_MATERIAL -> COGS, OFFICE_SUPPLY/SERVICE -> OPEX, ASSET -> Capitalize
	ProcurementType ProcurementType `json:"procurement_type" db:"procurement_type"`

	// PaymentTerms from the PO (needed for AP due date calculation)
	PaymentTerms string `json:"payment_terms" db:"payment_terms"`

	// Notes for the goods receipt
	Notes string `json:"notes,omitempty" db:"notes"`

	// ReceivedBy is the user who received the goods
	ReceivedBy string `json:"received_by" db:"received_by"`

	// PostedAt is when the GR was posted (triggers stock update and AP creation)
	PostedAt *time.Time `json:"posted_at,omitempty" db:"posted_at"`

	// PostedBy is the user who posted the GR
	PostedBy *string `json:"posted_by,omitempty" db:"posted_by"`

	// APCreated indicates if AP has been created for this GR
	APCreated bool `json:"ap_created" db:"ap_created"`

	// APID references the created AP (from Finance module)
	APID *string `json:"ap_id,omitempty" db:"ap_id"`

	// JournalEntryID references the journal entry created on posting
	JournalEntryID *string `json:"journal_entry_id,omitempty" db:"journal_entry_id"`

	// Items are the line items in this goods receipt
	Items []GoodsReceiptItem `json:"items,omitempty" db:"-"`
}

// Note: GoodsReceiptItem is defined in goods_receipt_item.go

// CalculateTotalAmount calculates the total amount from all items
func (gr *GoodsReceipt) CalculateTotalAmount() {
	var total float64
	for _, item := range gr.Items {
		total += item.LineTotal
	}
	gr.TotalAmount = total
}

// CanBePosted checks if the GR can be posted
func (gr *GoodsReceipt) CanBePosted() bool {
	return gr.Status == GoodsReceiptStatusDraft && len(gr.Items) > 0
}

// CanBeCancelled checks if the GR can be cancelled
func (gr *GoodsReceipt) CanBeCancelled() bool {
	return gr.Status == GoodsReceiptStatusDraft
}

// Post marks the GR as posted
func (gr *GoodsReceipt) Post(postedBy string) {
	now := time.Now()
	gr.Status = GoodsReceiptStatusPosted
	gr.PostedAt = &now
	gr.PostedBy = &postedBy
}

// GetAccountingTreatment returns how this GR should be treated in accounting
func (gr *GoodsReceipt) GetAccountingTreatment() string {
	switch gr.ProcurementType {
	case ProcurementTypeRawMaterial:
		return "COGS" // Debit Inventory, Credit AP
	case ProcurementTypeOfficeSupply, ProcurementTypeService:
		return "OPEX" // Debit Expense, Credit AP
	case ProcurementTypeAsset:
		return "CAPITALIZE" // Debit Fixed Asset, Credit AP
	default:
		return "OPEX"
	}
}
