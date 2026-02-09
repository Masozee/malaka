package domain

import (
	"context"

	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

// ShippingInvoiceService defines the interface for shipping invoice service operations.
type ShippingInvoiceService interface {
	// CreateShippingInvoice creates a new shipping invoice
	CreateShippingInvoice(ctx context.Context, request *dtos.CreateShippingInvoiceRequest) (*entities.ShippingInvoice, error)

	// GetShippingInvoiceByID retrieves a shipping invoice by ID
	GetShippingInvoiceByID(ctx context.Context, id uuid.ID) (*entities.ShippingInvoice, error)

	// GetShippingInvoiceByInvoiceNumber retrieves a shipping invoice by invoice number
	GetShippingInvoiceByInvoiceNumber(ctx context.Context, invoiceNumber string) (*entities.ShippingInvoice, error)

	// GetShippingInvoicesByShipmentID retrieves shipping invoices by shipment ID
	GetShippingInvoicesByShipmentID(ctx context.Context, shipmentID uuid.ID) ([]entities.ShippingInvoice, error)

	// GetShippingInvoicesByCourierID retrieves shipping invoices by courier ID
	GetShippingInvoicesByCourierID(ctx context.Context, courierID uuid.ID) ([]entities.ShippingInvoice, error)

	// GetShippingInvoicesByStatus retrieves shipping invoices by status
	GetShippingInvoicesByStatus(ctx context.Context, status string) ([]entities.ShippingInvoice, error)

	// GetAllShippingInvoices retrieves all shipping invoices with pagination
	GetAllShippingInvoices(ctx context.Context, page, pageSize int) ([]entities.ShippingInvoice, int, error)

	// UpdateShippingInvoice updates an existing shipping invoice
	UpdateShippingInvoice(ctx context.Context, id uuid.ID, request *dtos.UpdateShippingInvoiceRequest) (*entities.ShippingInvoice, error)

	// DeleteShippingInvoice deletes a shipping invoice by ID
	DeleteShippingInvoice(ctx context.Context, id uuid.ID) error

	// PayShippingInvoice marks a shipping invoice as paid
	PayShippingInvoice(ctx context.Context, id uuid.ID, request *dtos.PayShippingInvoiceRequest) (*entities.ShippingInvoice, error)

	// GetOverdueShippingInvoices retrieves overdue shipping invoices
	GetOverdueShippingInvoices(ctx context.Context) ([]entities.ShippingInvoice, error)

	// GenerateInvoiceNumber generates a unique invoice number
	GenerateInvoiceNumber(ctx context.Context) (string, error)
}
