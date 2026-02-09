package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// ShippingInvoice represents a shipping invoice entity.
type ShippingInvoice struct {
	types.BaseModel
	InvoiceNumber  string    `json:"invoice_number" db:"invoice_number" gorm:"uniqueIndex"`
	ShipmentID     uuid.ID   `json:"shipment_id" db:"shipment_id" gorm:"type:uuid"`
	CourierID      uuid.ID   `json:"courier_id" db:"courier_id" gorm:"type:uuid"`
	InvoiceDate    time.Time `json:"invoice_date" db:"invoice_date"`
	DueDate        time.Time `json:"due_date" db:"due_date"`
	Origin         string    `json:"origin" db:"origin"`
	Destination    string    `json:"destination" db:"destination"`
	Weight         float64   `json:"weight" db:"weight"`
	BaseRate       float64   `json:"base_rate" db:"base_rate"`
	AdditionalFees float64   `json:"additional_fees" db:"additional_fees"`
	TaxAmount      float64   `json:"tax_amount" db:"tax_amount"`
	TotalAmount    float64   `json:"total_amount" db:"total_amount"`
	Status         string    `json:"status" db:"status"` // PENDING, PAID, OVERDUE, CANCELLED
	PaidAt         *time.Time `json:"paid_at,omitempty" db:"paid_at"`
	Notes          string    `json:"notes,omitempty" db:"notes"`

	// Relationships
	Shipment *Shipment `json:"shipment,omitempty" gorm:"foreignKey:ShipmentID"`
	Courier  *Courier  `json:"courier,omitempty" gorm:"foreignKey:CourierID"`
}

// ShippingInvoiceStatus constants
const (
	ShippingInvoiceStatusPending   = "PENDING"
	ShippingInvoiceStatusPaid      = "PAID"
	ShippingInvoiceStatusOverdue   = "OVERDUE"
	ShippingInvoiceStatusCancelled = "CANCELLED"
)

// IsOverdue checks if the invoice is overdue
func (si *ShippingInvoice) IsOverdue() bool {
	return si.Status == ShippingInvoiceStatusPending && time.Now().After(si.DueDate)
}

// CalculateTotal calculates the total amount
func (si *ShippingInvoice) CalculateTotal() {
	subtotal := si.BaseRate + si.AdditionalFees
	si.TotalAmount = subtotal + si.TaxAmount
}

// MarkAsPaid marks the invoice as paid
func (si *ShippingInvoice) MarkAsPaid() {
	si.Status = ShippingInvoiceStatusPaid
	now := time.Now()
	si.PaidAt = &now
}
