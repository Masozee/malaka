package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// PurchaseVoucher represents a purchase voucher/kontrabon entity.
type PurchaseVoucher struct {
	types.BaseModel
	VoucherNumber   string    `json:"voucher_number" db:"voucher_number"`
	SupplierID      uuid.ID   `json:"supplier_id" db:"supplier_id"`
	VoucherDate     time.Time `json:"voucher_date" db:"voucher_date"`
	DueDate         time.Time `json:"due_date" db:"due_date"`
	TotalAmount     float64   `json:"total_amount" db:"total_amount"`
	PaidAmount      float64   `json:"paid_amount" db:"paid_amount"`
	RemainingAmount float64   `json:"remaining_amount" db:"remaining_amount"`
	DiscountAmount  float64   `json:"discount_amount" db:"discount_amount"`
	TaxAmount       float64   `json:"tax_amount" db:"tax_amount"`
	Description     string    `json:"description" db:"description"`
	Status          string    `json:"status" db:"status"` // "PENDING", "APPROVED", "PAID", "CANCELLED"
	ApprovedBy      uuid.ID   `json:"approved_by" db:"approved_by"`
	ApprovedAt      time.Time `json:"approved_at" db:"approved_at"`
}
