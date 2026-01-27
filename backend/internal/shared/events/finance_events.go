package events

import (
	"time"
)

// Event type constants for Finance module
const (
	// Accounts Payable events
	EventTypeAPCreated   = "finance.ap_created"
	EventTypeAPPaid      = "finance.ap_paid"
	EventTypeAPCancelled = "finance.ap_cancelled"

	// Payment events
	EventTypePaymentCreated   = "finance.payment_created"
	EventTypePaymentApproved  = "finance.payment_approved"
	EventTypePaymentProcessed = "finance.payment_processed"
	EventTypePaymentCancelled = "finance.payment_cancelled"

	// Budget events
	EventTypeBudgetCommitted = "finance.budget_committed"
	EventTypeBudgetRealized  = "finance.budget_realized"
	EventTypeBudgetReleased  = "finance.budget_released"
)

// APCreatedEvent is emitted when an AP record is created
// Subscribers: Procurement (update PO payment status), Inventory (mark GR as AP-linked)
type APCreatedEvent struct {
	BaseEvent
	APID            string    `json:"ap_id"`
	APNumber        string    `json:"ap_number"`
	GoodsReceiptID  string    `json:"goods_receipt_id"`
	GRNumber        string    `json:"gr_number"`
	PurchaseOrderID string    `json:"purchase_order_id"`
	PONumber        string    `json:"po_number"`
	SupplierID      string    `json:"supplier_id"`
	SupplierName    string    `json:"supplier_name"`
	Amount          float64   `json:"amount"`
	Currency        string    `json:"currency"`
	DueDate         time.Time `json:"due_date"`
	CreatedBy       string    `json:"created_by"`
}

// NewAPCreatedEvent creates a new AP created event
func NewAPCreatedEvent(apID, apNumber, grID, grNumber, poID, poNumber, supplierID, supplierName string, amount float64, currency string, dueDate time.Time, createdBy string) *APCreatedEvent {
	return &APCreatedEvent{
		BaseEvent:       NewBaseEvent(EventTypeAPCreated, apID, "AccountsPayable"),
		APID:            apID,
		APNumber:        apNumber,
		GoodsReceiptID:  grID,
		GRNumber:        grNumber,
		PurchaseOrderID: poID,
		PONumber:        poNumber,
		SupplierID:      supplierID,
		SupplierName:    supplierName,
		Amount:          amount,
		Currency:        currency,
		DueDate:         dueDate,
		CreatedBy:       createdBy,
	}
}

// APPaidEvent is emitted when an AP is fully paid
// Subscribers: Procurement (update PO payment status to paid)
type APPaidEvent struct {
	BaseEvent
	APID            string    `json:"ap_id"`
	APNumber        string    `json:"ap_number"`
	PurchaseOrderID string    `json:"purchase_order_id"`
	PONumber        string    `json:"po_number"`
	SupplierID      string    `json:"supplier_id"`
	TotalPaid       float64   `json:"total_paid"`
	PaidAt          time.Time `json:"paid_at"`
	PaymentID       string    `json:"payment_id"`
}

// NewAPPaidEvent creates a new AP paid event
func NewAPPaidEvent(apID, apNumber, poID, poNumber, supplierID string, totalPaid float64, paymentID string) *APPaidEvent {
	return &APPaidEvent{
		BaseEvent:       NewBaseEvent(EventTypeAPPaid, apID, "AccountsPayable"),
		APID:            apID,
		APNumber:        apNumber,
		PurchaseOrderID: poID,
		PONumber:        poNumber,
		SupplierID:      supplierID,
		TotalPaid:       totalPaid,
		PaidAt:          time.Now(),
		PaymentID:       paymentID,
	}
}

// BudgetCommittedEvent is emitted when budget is committed
// Subscribers: Accounting (update budget actuals)
type BudgetCommittedEvent struct {
	BaseEvent
	CommitmentID  string  `json:"commitment_id"`
	BudgetID      string  `json:"budget_id"`
	AccountID     string  `json:"account_id"`
	Amount        float64 `json:"amount"`
	ReferenceType string  `json:"reference_type"` // PURCHASE_ORDER
	ReferenceID   string  `json:"reference_id"`
	CommittedBy   string  `json:"committed_by"`
}

// NewBudgetCommittedEvent creates a new budget committed event
func NewBudgetCommittedEvent(commitmentID, budgetID, accountID string, amount float64, refType, refID, committedBy string) *BudgetCommittedEvent {
	return &BudgetCommittedEvent{
		BaseEvent:     NewBaseEvent(EventTypeBudgetCommitted, commitmentID, "BudgetCommitment"),
		CommitmentID:  commitmentID,
		BudgetID:      budgetID,
		AccountID:     accountID,
		Amount:        amount,
		ReferenceType: refType,
		ReferenceID:   refID,
		CommittedBy:   committedBy,
	}
}

// BudgetRealizedEvent is emitted when budget is realized
// Subscribers: Accounting (update budget actuals)
type BudgetRealizedEvent struct {
	BaseEvent
	RealizationID string  `json:"realization_id"`
	CommitmentID  string  `json:"commitment_id,omitempty"` // If realizing a prior commitment
	BudgetID      string  `json:"budget_id"`
	AccountID     string  `json:"account_id"`
	Amount        float64 `json:"amount"`
	ReferenceType string  `json:"reference_type"` // GOODS_RECEIPT, AP_INVOICE
	ReferenceID   string  `json:"reference_id"`
	RealizedBy    string  `json:"realized_by"`
}

// NewBudgetRealizedEvent creates a new budget realized event
func NewBudgetRealizedEvent(realizationID, commitmentID, budgetID, accountID string, amount float64, refType, refID, realizedBy string) *BudgetRealizedEvent {
	return &BudgetRealizedEvent{
		BaseEvent:     NewBaseEvent(EventTypeBudgetRealized, realizationID, "BudgetRealization"),
		RealizationID: realizationID,
		CommitmentID:  commitmentID,
		BudgetID:      budgetID,
		AccountID:     accountID,
		Amount:        amount,
		ReferenceType: refType,
		ReferenceID:   refID,
		RealizedBy:    realizedBy,
	}
}
