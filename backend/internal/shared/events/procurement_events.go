package events

import (
	"time"

	"malaka/internal/shared/integration"
)

// Event type constants for Procurement module
const (
	// Purchase Request events
	EventTypePRCreated   = "procurement.pr_created"
	EventTypePRSubmitted = "procurement.pr_submitted"
	EventTypePRApproved  = "procurement.pr_approved"
	EventTypePRRejected  = "procurement.pr_rejected"
	EventTypePRCancelled = "procurement.pr_cancelled"

	// Purchase Order events
	EventTypePOCreated   = "procurement.po_created"
	EventTypePOSubmitted = "procurement.po_submitted"
	EventTypePOApproved  = "procurement.po_approved"
	EventTypePOSent      = "procurement.po_sent"
	EventTypePOConfirmed = "procurement.po_confirmed"
	EventTypePOShipped   = "procurement.po_shipped"
	EventTypePOReceived  = "procurement.po_received"
	EventTypePOCancelled = "procurement.po_cancelled"

	// RFQ events
	EventTypeRFQCreated   = "procurement.rfq_created"
	EventTypeRFQPublished = "procurement.rfq_published"
	EventTypeRFQClosed    = "procurement.rfq_closed"
	EventTypeRFQCancelled = "procurement.rfq_cancelled"

	// Contract events
	EventTypeContractCreated    = "procurement.contract_created"
	EventTypeContractActivated  = "procurement.contract_activated"
	EventTypeContractExpiring   = "procurement.contract_expiring"
	EventTypeContractExpired    = "procurement.contract_expired"
	EventTypeContractTerminated = "procurement.contract_terminated"
)

// PurchaseOrderApprovedEvent is emitted when a PO is approved
// Subscribers: Inventory (expect incoming stock), Finance (budget commitment)
type PurchaseOrderApprovedEvent struct {
	BaseEvent
	PurchaseOrderID     string                      `json:"purchase_order_id"`
	PONumber            string                      `json:"po_number"`
	SupplierID          string                      `json:"supplier_id"`
	SupplierName        string                      `json:"supplier_name"`
	TotalAmount         float64                     `json:"total_amount"`
	Currency            string                      `json:"currency"`
	ProcurementType     integration.ProcurementType `json:"procurement_type"`
	ExpenseAccountID    *string                     `json:"expense_account_id,omitempty"`
	ExpectedDelivery    *time.Time                  `json:"expected_delivery,omitempty"`
	DeliveryAddress     string                      `json:"delivery_address"`
	PaymentTerms        string                      `json:"payment_terms"`
	ApprovedBy          string                      `json:"approved_by"`
	Items               []POItemEventData           `json:"items"`
}

// POItemEventData represents PO item data in events
type POItemEventData struct {
	ItemID      string  `json:"item_id"`
	ArticleID   *string `json:"article_id,omitempty"`
	ItemName    string  `json:"item_name"`
	Quantity    int     `json:"quantity"`
	Unit        string  `json:"unit"`
	UnitPrice   float64 `json:"unit_price"`
	LineTotal   float64 `json:"line_total"`
}

// NewPurchaseOrderApprovedEvent creates a new PO approved event
func NewPurchaseOrderApprovedEvent(poID, poNumber, supplierID, supplierName string, totalAmount float64, currency string, procType integration.ProcurementType, approvedBy string, items []POItemEventData) *PurchaseOrderApprovedEvent {
	return &PurchaseOrderApprovedEvent{
		BaseEvent:       NewBaseEvent(EventTypePOApproved, poID, "PurchaseOrder"),
		PurchaseOrderID: poID,
		PONumber:        poNumber,
		SupplierID:      supplierID,
		SupplierName:    supplierName,
		TotalAmount:     totalAmount,
		Currency:        currency,
		ProcurementType: procType,
		ApprovedBy:      approvedBy,
		Items:           items,
	}
}

// PurchaseOrderCancelledEvent is emitted when a PO is cancelled
// Subscribers: Inventory (cancel expected stock), Finance (release budget commitment)
type PurchaseOrderCancelledEvent struct {
	BaseEvent
	PurchaseOrderID string    `json:"purchase_order_id"`
	PONumber        string    `json:"po_number"`
	SupplierID      string    `json:"supplier_id"`
	CancelReason    string    `json:"cancel_reason"`
	CancelledBy     string    `json:"cancelled_by"`
	CancelledAt     time.Time `json:"cancelled_at"`
}

// NewPurchaseOrderCancelledEvent creates a new PO cancelled event
func NewPurchaseOrderCancelledEvent(poID, poNumber, supplierID, reason, cancelledBy string) *PurchaseOrderCancelledEvent {
	return &PurchaseOrderCancelledEvent{
		BaseEvent:       NewBaseEvent(EventTypePOCancelled, poID, "PurchaseOrder"),
		PurchaseOrderID: poID,
		PONumber:        poNumber,
		SupplierID:      supplierID,
		CancelReason:    reason,
		CancelledBy:     cancelledBy,
		CancelledAt:     time.Now(),
	}
}

// PurchaseOrderReceivedEvent is emitted when all items in a PO are received
// Subscribers: Finance (finalize AP)
type PurchaseOrderReceivedEvent struct {
	BaseEvent
	PurchaseOrderID string    `json:"purchase_order_id"`
	PONumber        string    `json:"po_number"`
	GoodsReceiptID  string    `json:"goods_receipt_id"`
	ReceivedAt      time.Time `json:"received_at"`
	ReceivedBy      string    `json:"received_by"`
}

// PurchaseRequestApprovedEvent is emitted when a PR is approved
type PurchaseRequestApprovedEvent struct {
	BaseEvent
	PurchaseRequestID string  `json:"purchase_request_id"`
	RequestNumber     string  `json:"request_number"`
	RequesterID       string  `json:"requester_id"`
	TotalAmount       float64 `json:"total_amount"`
	ApprovedBy        string  `json:"approved_by"`
}

// NewPurchaseRequestApprovedEvent creates a new PR approved event
func NewPurchaseRequestApprovedEvent(prID, requestNumber, requesterID string, totalAmount float64, approvedBy string) *PurchaseRequestApprovedEvent {
	return &PurchaseRequestApprovedEvent{
		BaseEvent:         NewBaseEvent(EventTypePRApproved, prID, "PurchaseRequest"),
		PurchaseRequestID: prID,
		RequestNumber:     requestNumber,
		RequesterID:       requesterID,
		TotalAmount:       totalAmount,
		ApprovedBy:        approvedBy,
	}
}
