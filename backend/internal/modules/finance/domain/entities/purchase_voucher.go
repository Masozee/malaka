package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// PurchaseVoucher represents a purchase voucher/kontrabon entity.
type PurchaseVoucher struct {
	types.BaseModel
	VoucherNumber string    `json:"voucher_number"`
	VoucherDate   time.Time `json:"voucher_date"`
	SupplierID    string    `json:"supplier_id"`
	InvoiceID     string    `json:"invoice_id"`
	TotalAmount   float64   `json:"total_amount"`
	TaxAmount     float64   `json:"tax_amount"`
	GrandTotal    float64   `json:"grand_total"`
	DueDate       time.Time `json:"due_date"`
	Status        string    `json:"status"` // "pending", "approved", "paid", "cancelled"
	Description   string    `json:"description"`
	ApprovedBy    string    `json:"approved_by"`
	ApprovedAt    time.Time `json:"approved_at"`
}