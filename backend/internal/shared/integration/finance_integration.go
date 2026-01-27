package integration

import (
	"context"
	"time"
)

// AccountsPayableDTO represents an AP record for cross-module access
type AccountsPayableDTO struct {
	ID              string    `json:"id"`
	APNumber        string    `json:"ap_number"`
	SupplierID      string    `json:"supplier_id"`
	SupplierName    string    `json:"supplier_name"`
	GoodsReceiptID  *string   `json:"goods_receipt_id,omitempty"`
	GRNumber        *string   `json:"gr_number,omitempty"`
	PurchaseOrderID *string   `json:"purchase_order_id,omitempty"`
	PONumber        *string   `json:"po_number,omitempty"`
	InvoiceNumber   string    `json:"invoice_number"`
	InvoiceDate     time.Time `json:"invoice_date"`
	DueDate         time.Time `json:"due_date"`
	Amount          float64   `json:"amount"`
	PaidAmount      float64   `json:"paid_amount"`
	Balance         float64   `json:"balance"`
	Currency        string    `json:"currency"`
	Status          string    `json:"status"` // OPEN, PARTIAL, PAID, CANCELLED
	PaymentTerms    string    `json:"payment_terms"`
}

// FinanceReader provides read-only access to Finance data for other modules.
type FinanceReader interface {
	// GetAccountsPayableByID retrieves an AP record by ID
	GetAccountsPayableByID(ctx context.Context, id string) (*AccountsPayableDTO, error)

	// GetAccountsPayableByPO retrieves AP records for a specific PO
	GetAccountsPayableByPO(ctx context.Context, poID string) ([]*AccountsPayableDTO, error)

	// GetAccountsPayableByGR retrieves AP records for a specific GR
	GetAccountsPayableByGR(ctx context.Context, grID string) ([]*AccountsPayableDTO, error)

	// GetAccountsPayableBySupplier retrieves all AP for a supplier
	GetAccountsPayableBySupplier(ctx context.Context, supplierID string) ([]*AccountsPayableDTO, error)

	// GetOutstandingPayables retrieves all unpaid AP
	GetOutstandingPayables(ctx context.Context) ([]*AccountsPayableDTO, error)
}

// FinanceNotifier allows other modules to notify Finance of events.
type FinanceNotifier interface {
	// NotifyGoodsReceiptPosted notifies Finance to create AP from GR
	NotifyGoodsReceiptPosted(ctx context.Context, notification *GRPostedForAPNotification) error

	// NotifyPOApproved notifies Finance of PO approval (for commitment tracking)
	NotifyPOApproved(ctx context.Context, notification *POApprovedNotification) error
}

// GRPostedForAPNotification represents notification to create AP from posted GR
type GRPostedForAPNotification struct {
	GoodsReceiptID  string          `json:"goods_receipt_id"`
	GRNumber        string          `json:"gr_number"`
	PurchaseOrderID string          `json:"purchase_order_id"`
	PONumber        string          `json:"po_number"`
	SupplierID      string          `json:"supplier_id"`
	SupplierName    string          `json:"supplier_name"`
	TotalAmount     float64         `json:"total_amount"`
	Currency        string          `json:"currency"`
	ProcurementType ProcurementType `json:"procurement_type"`
	PaymentTerms    string          `json:"payment_terms"`
	ReceiptDate     time.Time       `json:"receipt_date"`
	PostedBy        string          `json:"posted_by"`
}

// POApprovedNotification represents notification of PO approval
type POApprovedNotification struct {
	PurchaseOrderID string          `json:"purchase_order_id"`
	PONumber        string          `json:"po_number"`
	SupplierID      string          `json:"supplier_id"`
	TotalAmount     float64         `json:"total_amount"`
	Currency        string          `json:"currency"`
	ProcurementType ProcurementType `json:"procurement_type"`
	ExpenseAccountID *string        `json:"expense_account_id,omitempty"`
	ApprovedAt      time.Time       `json:"approved_at"`
	ApprovedBy      string          `json:"approved_by"`
}

// PaymentNotification represents notification of payment made
type PaymentNotification struct {
	PaymentID       string    `json:"payment_id"`
	PaymentNumber   string    `json:"payment_number"`
	APID            string    `json:"ap_id"`
	Amount          float64   `json:"amount"`
	PaymentDate     time.Time `json:"payment_date"`
	PaymentMethod   string    `json:"payment_method"`
	ReferenceNumber string    `json:"reference_number"`
}
