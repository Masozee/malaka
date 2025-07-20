package dtos

import (
	"time"

	"github.com/google/uuid"
)

// CreateShippingInvoiceRequest represents the request to create a shipping invoice.
type CreateShippingInvoiceRequest struct {
	ShipmentID     uuid.UUID `json:"shipment_id" binding:"required"`
	CourierID      uuid.UUID `json:"courier_id" binding:"required"`
	InvoiceDate    time.Time `json:"invoice_date" binding:"required"`
	DueDate        time.Time `json:"due_date" binding:"required"`
	Origin         string    `json:"origin" binding:"required"`
	Destination    string    `json:"destination" binding:"required"`
	Weight         float64   `json:"weight" binding:"required,gt=0"`
	BaseRate       float64   `json:"base_rate" binding:"required,gt=0"`
	AdditionalFees float64   `json:"additional_fees"`
	TaxAmount      float64   `json:"tax_amount"`
	Notes          string    `json:"notes"`
}

// UpdateShippingInvoiceRequest represents the request to update a shipping invoice.
type UpdateShippingInvoiceRequest struct {
	InvoiceDate    *time.Time `json:"invoice_date,omitempty"`
	DueDate        *time.Time `json:"due_date,omitempty"`
	Origin         *string    `json:"origin,omitempty"`
	Destination    *string    `json:"destination,omitempty"`
	Weight         *float64   `json:"weight,omitempty"`
	BaseRate       *float64   `json:"base_rate,omitempty"`
	AdditionalFees *float64   `json:"additional_fees,omitempty"`
	TaxAmount      *float64   `json:"tax_amount,omitempty"`
	Status         *string    `json:"status,omitempty"`
	Notes          *string    `json:"notes,omitempty"`
}

// ShippingInvoiceResponse represents the response for a shipping invoice.
type ShippingInvoiceResponse struct {
	ID             uuid.UUID `json:"id"`
	InvoiceNumber  string    `json:"invoice_number"`
	ShipmentID     uuid.UUID `json:"shipment_id"`
	CourierID      uuid.UUID `json:"courier_id"`
	InvoiceDate    time.Time `json:"invoice_date"`
	DueDate        time.Time `json:"due_date"`
	Origin         string    `json:"origin"`
	Destination    string    `json:"destination"`
	Weight         float64   `json:"weight"`
	BaseRate       float64   `json:"base_rate"`
	AdditionalFees float64   `json:"additional_fees"`
	TaxAmount      float64   `json:"tax_amount"`
	TotalAmount    float64   `json:"total_amount"`
	Status         string    `json:"status"`
	PaidAt         *time.Time `json:"paid_at,omitempty"`
	Notes          string    `json:"notes,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// PayShippingInvoiceRequest represents the request to pay a shipping invoice.
type PayShippingInvoiceRequest struct {
	PaymentDate   time.Time `json:"payment_date" binding:"required"`
	PaymentMethod string    `json:"payment_method" binding:"required"`
	PaymentNotes  string    `json:"payment_notes"`
}

// ShippingInvoiceListResponse represents the response for listing shipping invoices.
type ShippingInvoiceListResponse struct {
	Data       []ShippingInvoiceResponse `json:"data"`
	TotalCount int                       `json:"total_count"`
	Page       int                       `json:"page"`
	PageSize   int                       `json:"page_size"`
}