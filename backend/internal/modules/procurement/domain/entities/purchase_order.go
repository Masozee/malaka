package entities

import (
	"time"

	"github.com/google/uuid"
)

// PurchaseOrderStatus represents the status of a purchase order
type PurchaseOrderStatus string

const (
	PurchaseOrderStatusDraft     PurchaseOrderStatus = "draft"
	PurchaseOrderStatusPending   PurchaseOrderStatus = "pending_approval" // Added
	PurchaseOrderStatusApproved  PurchaseOrderStatus = "approved"         // Added
	PurchaseOrderStatusSent      PurchaseOrderStatus = "sent"
	PurchaseOrderStatusConfirmed PurchaseOrderStatus = "confirmed"
	PurchaseOrderStatusShipped   PurchaseOrderStatus = "shipped"
	PurchaseOrderStatusReceived  PurchaseOrderStatus = "received"
	PurchaseOrderStatusCancelled PurchaseOrderStatus = "cancelled"
)

// PurchaseOrderPaymentStatus represents the payment status of a purchase order
type PurchaseOrderPaymentStatus string

const (
	PurchaseOrderPaymentUnpaid  PurchaseOrderPaymentStatus = "unpaid"
	PurchaseOrderPaymentPartial PurchaseOrderPaymentStatus = "partial"
	PurchaseOrderPaymentPaid    PurchaseOrderPaymentStatus = "paid"
)

// ProcurementType represents the type of procurement for accounting classification
type ProcurementType string

const (
	// ProcurementTypeRawMaterial - Items that flow into COGS (Cost of Goods Sold)
	ProcurementTypeRawMaterial ProcurementType = "RAW_MATERIAL"
	// ProcurementTypeOfficeSupply - Items recorded as OPEX (Operating Expenses)
	ProcurementTypeOfficeSupply ProcurementType = "OFFICE_SUPPLY"
	// ProcurementTypeAsset - Items that are capitalized and depreciated
	ProcurementTypeAsset ProcurementType = "ASSET"
	// ProcurementTypeService - Services recorded as OPEX
	ProcurementTypeService ProcurementType = "SERVICE"
)

// PurchaseOrder represents a purchase order in the procurement module
type PurchaseOrder struct {
	ID                   string                     `json:"id" db:"id"`
	PONumber             string                     `json:"po_number" db:"po_number"`
	SupplierID           string                     `json:"supplier_id" db:"supplier_id"`
	SupplierName         string                     `json:"supplier_name" db:"supplier_name"`
	PurchaseRequestID    *string                    `json:"purchase_request_id,omitempty" db:"purchase_request_id"`
	OrderDate            time.Time                  `json:"order_date" db:"order_date"`
	ExpectedDeliveryDate *time.Time                 `json:"expected_delivery_date,omitempty" db:"expected_delivery_date"`
	DeliveryAddress      string                     `json:"delivery_address" db:"delivery_address"`
	PaymentTerms         string                     `json:"payment_terms" db:"payment_terms"`
	Currency             string                     `json:"currency" db:"currency"`
	Subtotal             float64                    `json:"subtotal" db:"subtotal"`
	DiscountAmount       float64                    `json:"discount_amount" db:"discount_amount"`
	TaxAmount            float64                    `json:"tax_amount" db:"tax_amount"`
	ShippingCost         float64                    `json:"shipping_cost" db:"shipping_cost"`
	TotalAmount          float64                    `json:"total_amount" db:"total_amount"`
	Status               PurchaseOrderStatus        `json:"status" db:"status"`
	PaymentStatus        PurchaseOrderPaymentStatus `json:"payment_status" db:"payment_status"`
	Notes                string                     `json:"notes,omitempty" db:"notes"`
	// ProcurementType determines how this PO flows into accounting (COGS, OPEX, or Asset)
	ProcurementType      ProcurementType            `json:"procurement_type" db:"procurement_type"`
	// ExpenseAccountID is the GL account to debit for this procurement (optional, defaults based on type)
	ExpenseAccountID     *string                    `json:"expense_account_id,omitempty" db:"expense_account_id"`
	// BudgetCommitmentID references the budget commitment created when PO is approved
	BudgetCommitmentID   *string                    `json:"budget_commitment_id,omitempty" db:"budget_commitment_id"`
	CreatedBy            string                     `json:"created_by" db:"created_by"`
	CreatedByName        string                     `json:"created_by_name" db:"created_by_name"`
	CreatedByPosition    string                     `json:"created_by_position" db:"created_by_position"`
	ApprovedBy           *string                    `json:"approved_by,omitempty" db:"approved_by"`
	ApprovedAt           *time.Time                 `json:"approved_at,omitempty" db:"approved_at"`
	SentAt               *time.Time                 `json:"sent_at,omitempty" db:"sent_at"`
	ConfirmedAt          *time.Time                 `json:"confirmed_at,omitempty" db:"confirmed_at"`
	ReceivedAt           *time.Time                 `json:"received_at,omitempty" db:"received_at"`
	CancelledAt          *time.Time                 `json:"cancelled_at,omitempty" db:"cancelled_at"`
	CancelReason         string                     `json:"cancel_reason,omitempty" db:"cancel_reason"`
	CreatedAt            time.Time                  `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time                  `json:"updated_at" db:"updated_at"`
	Items                []PurchaseOrderItem        `json:"items,omitempty" db:"-"`
}

// PurchaseOrderItem represents a line item in a purchase order
type PurchaseOrderItem struct {
	ID                 string    `json:"id" db:"id"`
	PurchaseOrderID    string    `json:"purchase_order_id" db:"purchase_order_id"`
	ItemName           string    `json:"item_name" db:"item_name"`
	Description        string    `json:"description,omitempty" db:"description"`
	Specification      string    `json:"specification,omitempty" db:"specification"`
	Quantity           int       `json:"quantity" db:"quantity"`
	Unit               string    `json:"unit" db:"unit"`
	UnitPrice          float64   `json:"unit_price" db:"unit_price"`
	DiscountPercentage float64   `json:"discount_percentage" db:"discount_percentage"`
	TaxPercentage      float64   `json:"tax_percentage" db:"tax_percentage"`
	LineTotal          float64   `json:"line_total" db:"line_total"`
	ReceivedQuantity   int       `json:"received_quantity" db:"received_quantity"`
	Currency           string    `json:"currency" db:"currency"`
	CreatedAt          time.Time `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time `json:"updated_at" db:"updated_at"`
}

// NewPurchaseOrder creates a new purchase order with default values
func NewPurchaseOrder(supplierID, createdBy string) *PurchaseOrder {
	now := time.Now()
	return &PurchaseOrder{
		ID:              uuid.New().String(),
		SupplierID:      supplierID,
		OrderDate:       now,
		Currency:        "IDR",
		Status:          PurchaseOrderStatusDraft,
		PaymentStatus:   PurchaseOrderPaymentUnpaid,
		ProcurementType: ProcurementTypeRawMaterial, // Default to raw material
		CreatedBy:       createdBy,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}

// NewPurchaseOrderWithType creates a new purchase order with a specific procurement type
func NewPurchaseOrderWithType(supplierID, createdBy string, procType ProcurementType) *PurchaseOrder {
	po := NewPurchaseOrder(supplierID, createdBy)
	po.ProcurementType = procType
	return po
}

// IsValidProcurementType checks if the procurement type is valid
func IsValidProcurementType(t ProcurementType) bool {
	switch t {
	case ProcurementTypeRawMaterial, ProcurementTypeOfficeSupply, ProcurementTypeAsset, ProcurementTypeService:
		return true
	}
	return false
}

// GetAccountingTreatment returns how this procurement should be treated in accounting
func (po *PurchaseOrder) GetAccountingTreatment() string {
	switch po.ProcurementType {
	case ProcurementTypeRawMaterial:
		return "COGS" // Flows into Cost of Goods Sold via Inventory
	case ProcurementTypeOfficeSupply, ProcurementTypeService:
		return "OPEX" // Direct expense
	case ProcurementTypeAsset:
		return "CAPITALIZE" // Capitalize and depreciate
	default:
		return "OPEX"
	}
}

// NewPurchaseOrderItem creates a new purchase order item
func NewPurchaseOrderItem(purchaseOrderID string) *PurchaseOrderItem {
	now := time.Now()
	return &PurchaseOrderItem{
		ID:              uuid.New().String(),
		PurchaseOrderID: purchaseOrderID,
		Quantity:        1,
		Unit:            "pcs",
		Currency:        "IDR",
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}

// CalculateLineTotal calculates the line total for an item
func (i *PurchaseOrderItem) CalculateLineTotal() {
	subtotal := float64(i.Quantity) * i.UnitPrice
	discount := subtotal * (i.DiscountPercentage / 100)
	taxable := subtotal - discount
	tax := taxable * (i.TaxPercentage / 100)
	i.LineTotal = taxable + tax
}

// CalculateTotals calculates all totals for the purchase order
func (po *PurchaseOrder) CalculateTotals() {
	var subtotal, discountAmount, taxAmount float64

	for _, item := range po.Items {
		itemSubtotal := float64(item.Quantity) * item.UnitPrice
		itemDiscount := itemSubtotal * (item.DiscountPercentage / 100)
		itemTaxable := itemSubtotal - itemDiscount
		itemTax := itemTaxable * (item.TaxPercentage / 100)

		subtotal += itemSubtotal
		discountAmount += itemDiscount
		taxAmount += itemTax
	}

	po.Subtotal = subtotal
	po.DiscountAmount = discountAmount
	po.TaxAmount = taxAmount
	po.TotalAmount = subtotal - discountAmount + taxAmount + po.ShippingCost
}

// GeneratePONumber generates a unique PO number
func GeneratePONumber() string {
	now := time.Now()
	return "PO-" + now.Format("20060102") + "-" + uuid.New().String()[:8]
}
