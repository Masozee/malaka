package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// InvoiceCreateRequest represents the request to create an invoice.
type InvoiceCreateRequest struct {
	InvoiceNumber string    `json:"invoice_number" binding:"required"`
	InvoiceDate   time.Time `json:"invoice_date" binding:"required"`
	DueDate       time.Time `json:"due_date" binding:"required"`
	TotalAmount   float64   `json:"total_amount" binding:"required"`
	TaxAmount     float64   `json:"tax_amount"`
	GrandTotal    float64   `json:"grand_total" binding:"required"`
	CustomerID    string    `json:"customer_id"`
	SupplierID    string    `json:"supplier_id"`
}

// InvoiceUpdateRequest represents the request to update an invoice.
type InvoiceUpdateRequest struct {
	InvoiceNumber string    `json:"invoice_number"`
	InvoiceDate   time.Time `json:"invoice_date"`
	DueDate       time.Time `json:"due_date"`
	TotalAmount   float64   `json:"total_amount"`
	TaxAmount     float64   `json:"tax_amount"`
	GrandTotal    float64   `json:"grand_total"`
	CustomerID    string    `json:"customer_id"`
	SupplierID    string    `json:"supplier_id"`
}

// InvoiceResponse represents the response for an invoice.
type InvoiceResponse struct {
	ID            string    `json:"id"`
	InvoiceNumber string    `json:"invoice_number"`
	InvoiceDate   time.Time `json:"invoice_date"`
	DueDate       time.Time `json:"due_date"`
	TotalAmount   float64   `json:"total_amount"`
	TaxAmount     float64   `json:"tax_amount"`
	GrandTotal    float64   `json:"grand_total"`
	CustomerID    string    `json:"customer_id"`
	SupplierID    string    `json:"supplier_id"`
	CreatedAt     string    `json:"created_at"`
	UpdatedAt     string    `json:"updated_at"`
}

// ToInvoiceEntity converts InvoiceCreateRequest to entities.Invoice.
func (req *InvoiceCreateRequest) ToInvoiceEntity() *entities.Invoice {
	return &entities.Invoice{
		BaseModel:     types.BaseModel{},
		InvoiceNumber: req.InvoiceNumber,
		InvoiceDate:   req.InvoiceDate,
		DueDate:       req.DueDate,
		TotalAmount:   req.TotalAmount,
		TaxAmount:     req.TaxAmount,
		GrandTotal:    req.GrandTotal,
		CustomerID:    safeParseUUID(req.CustomerID),
		SupplierID:    safeParseUUID(req.SupplierID),
	}
}

// ToInvoiceEntity converts InvoiceUpdateRequest to entities.Invoice.
func (req *InvoiceUpdateRequest) ToInvoiceEntity() *entities.Invoice {
	return &entities.Invoice{
		BaseModel:     types.BaseModel{},
		InvoiceNumber: req.InvoiceNumber,
		InvoiceDate:   req.InvoiceDate,
		DueDate:       req.DueDate,
		TotalAmount:   req.TotalAmount,
		TaxAmount:     req.TaxAmount,
		GrandTotal:    req.GrandTotal,
		CustomerID:    safeParseUUID(req.CustomerID),
		SupplierID:    safeParseUUID(req.SupplierID),
	}
}

// FromInvoiceEntity converts entities.Invoice to InvoiceResponse.
func FromInvoiceEntity(inv *entities.Invoice) *InvoiceResponse {
	return &InvoiceResponse{
		ID:            inv.ID.String(),
		InvoiceNumber: inv.InvoiceNumber,
		InvoiceDate:   inv.InvoiceDate,
		DueDate:       inv.DueDate,
		TotalAmount:   inv.TotalAmount,
		TaxAmount:     inv.TaxAmount,
		GrandTotal:    inv.GrandTotal,
		CustomerID:    inv.CustomerID.String(),
		SupplierID:    inv.SupplierID.String(),
		CreatedAt:     inv.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:     inv.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
