package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// PurchaseVoucher represents a purchase voucher/kontrabon entity.
type PurchaseVoucher struct {
	types.BaseModel
	VoucherNumber string    `json:"voucher_number" db:"voucher_number"`
	VoucherDate   time.Time `json:"voucher_date" db:"voucher_date"`
	SupplierID    uuid.ID   `json:"supplier_id" db:"supplier_id"`
	InvoiceID     uuid.ID   `json:"invoice_id" db:"invoice_id"`
	TotalAmount   float64   `json:"total_amount" db:"total_amount"`
	TaxAmount     float64   `json:"tax_amount" db:"tax_amount"`
	GrandTotal    float64   `json:"grand_total" db:"grand_total"`
	DueDate       time.Time `json:"due_date" db:"due_date"`
	Status        string    `json:"status" db:"status"` // "pending", "approved", "paid", "cancelled"
	Description   string    `json:"description" db:"description"`
	ApprovedBy    uuid.ID   `json:"approved_by" db:"approved_by"`
	ApprovedAt    time.Time `json:"approved_at" db:"approved_at"`
}
