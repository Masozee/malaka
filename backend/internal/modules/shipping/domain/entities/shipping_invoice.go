package entities

import (
	"time"

	"github.com/google/uuid"
	"malaka/internal/shared/types"
)

// ShippingInvoice represents a shipping invoice entity.
type ShippingInvoice struct {
	types.BaseModel
	InvoiceNumber   string    `json:"invoice_number" gorm:"uniqueIndex"`
	ShipmentID      uuid.UUID `json:"shipment_id" gorm:"type:uuid"`
	CourierID       uuid.UUID `json:"courier_id" gorm:"type:uuid"`
	InvoiceDate     time.Time `json:"invoice_date"`
	DueDate         time.Time `json:"due_date"`
	Origin          string    `json:"origin"`
	Destination     string    `json:"destination"`
	Weight          float64   `json:"weight"`
	BaseRate        float64   `json:"base_rate"`
	AdditionalFees  float64   `json:"additional_fees"`
	TaxAmount       float64   `json:"tax_amount"`
	TotalAmount     float64   `json:"total_amount"`
	Status          string    `json:"status"` // PENDING, PAID, OVERDUE, CANCELLED
	PaidAt          *time.Time `json:"paid_at,omitempty"`
	Notes           string    `json:"notes,omitempty"`
	
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