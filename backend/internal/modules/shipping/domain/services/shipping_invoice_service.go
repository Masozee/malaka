package services

import (
	"context"
	"fmt"
	"time"

	"malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/repositories"
	"malaka/internal/shared/uuid"
)

// shippingInvoiceService implements the ShippingInvoiceService interface.
type shippingInvoiceService struct {
	repo repositories.ShippingInvoiceRepository
}

// NewShippingInvoiceService creates a new ShippingInvoiceService instance.
func NewShippingInvoiceService(repo repositories.ShippingInvoiceRepository) domain.ShippingInvoiceService {
	return &shippingInvoiceService{
		repo: repo,
	}
}

// CreateShippingInvoice creates a new shipping invoice.
func (s *shippingInvoiceService) CreateShippingInvoice(ctx context.Context, request *dtos.CreateShippingInvoiceRequest) (*entities.ShippingInvoice, error) {
	// Generate invoice number
	invoiceNumber, err := s.GenerateInvoiceNumber(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to generate invoice number: %w", err)
	}

	// Create the shipping invoice entity
	invoice := &entities.ShippingInvoice{
		InvoiceNumber:  invoiceNumber,
		ShipmentID:     request.ShipmentID,
		CourierID:      request.CourierID,
		InvoiceDate:    request.InvoiceDate,
		DueDate:        request.DueDate,
		Origin:         request.Origin,
		Destination:    request.Destination,
		Weight:         request.Weight,
		BaseRate:       request.BaseRate,
		AdditionalFees: request.AdditionalFees,
		TaxAmount:      request.TaxAmount,
		Status:         entities.ShippingInvoiceStatusPending,
		Notes:          request.Notes,
	}

	// Generate UUID for the invoice
	invoice.ID = uuid.New()

	// Calculate total amount
	invoice.CalculateTotal()

	// Save the invoice
	if err := s.repo.CreateShippingInvoice(ctx, invoice); err != nil {
		return nil, fmt.Errorf("failed to create shipping invoice: %w", err)
	}

	return invoice, nil
}

// GetShippingInvoiceByID retrieves a shipping invoice by ID.
func (s *shippingInvoiceService) GetShippingInvoiceByID(ctx context.Context, id uuid.ID) (*entities.ShippingInvoice, error) {
	invoice, err := s.repo.GetShippingInvoiceByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get shipping invoice by ID: %w", err)
	}

	return invoice, nil
}

// GetShippingInvoiceByInvoiceNumber retrieves a shipping invoice by invoice number.
func (s *shippingInvoiceService) GetShippingInvoiceByInvoiceNumber(ctx context.Context, invoiceNumber string) (*entities.ShippingInvoice, error) {
	invoice, err := s.repo.GetShippingInvoiceByInvoiceNumber(ctx, invoiceNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to get shipping invoice by invoice number: %w", err)
	}

	return invoice, nil
}

// GetShippingInvoicesByShipmentID retrieves shipping invoices by shipment ID.
func (s *shippingInvoiceService) GetShippingInvoicesByShipmentID(ctx context.Context, shipmentID uuid.ID) ([]entities.ShippingInvoice, error) {
	invoices, err := s.repo.GetShippingInvoicesByShipmentID(ctx, shipmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get shipping invoices by shipment ID: %w", err)
	}

	return invoices, nil
}

// GetShippingInvoicesByCourierID retrieves shipping invoices by courier ID.
func (s *shippingInvoiceService) GetShippingInvoicesByCourierID(ctx context.Context, courierID uuid.ID) ([]entities.ShippingInvoice, error) {
	invoices, err := s.repo.GetShippingInvoicesByCourierID(ctx, courierID)
	if err != nil {
		return nil, fmt.Errorf("failed to get shipping invoices by courier ID: %w", err)
	}

	return invoices, nil
}

// GetShippingInvoicesByStatus retrieves shipping invoices by status.
func (s *shippingInvoiceService) GetShippingInvoicesByStatus(ctx context.Context, status string) ([]entities.ShippingInvoice, error) {
	invoices, err := s.repo.GetShippingInvoicesByStatus(ctx, status)
	if err != nil {
		return nil, fmt.Errorf("failed to get shipping invoices by status: %w", err)
	}

	return invoices, nil
}

// GetAllShippingInvoices retrieves all shipping invoices with pagination.
func (s *shippingInvoiceService) GetAllShippingInvoices(ctx context.Context, page, pageSize int) ([]entities.ShippingInvoice, int, error) {
	invoices, totalCount, err := s.repo.GetAllShippingInvoices(ctx, page, pageSize)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get all shipping invoices: %w", err)
	}

	return invoices, totalCount, nil
}

// UpdateShippingInvoice updates an existing shipping invoice.
func (s *shippingInvoiceService) UpdateShippingInvoice(ctx context.Context, id uuid.ID, request *dtos.UpdateShippingInvoiceRequest) (*entities.ShippingInvoice, error) {
	// Get the existing invoice
	invoice, err := s.repo.GetShippingInvoiceByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get shipping invoice: %w", err)
	}

	// Update fields if provided
	if request.InvoiceDate != nil {
		invoice.InvoiceDate = *request.InvoiceDate
	}
	if request.DueDate != nil {
		invoice.DueDate = *request.DueDate
	}
	if request.Origin != nil {
		invoice.Origin = *request.Origin
	}
	if request.Destination != nil {
		invoice.Destination = *request.Destination
	}
	if request.Weight != nil {
		invoice.Weight = *request.Weight
	}
	if request.BaseRate != nil {
		invoice.BaseRate = *request.BaseRate
	}
	if request.AdditionalFees != nil {
		invoice.AdditionalFees = *request.AdditionalFees
	}
	if request.TaxAmount != nil {
		invoice.TaxAmount = *request.TaxAmount
	}
	if request.Status != nil {
		invoice.Status = *request.Status
	}
	if request.Notes != nil {
		invoice.Notes = *request.Notes
	}

	// Recalculate total amount
	invoice.CalculateTotal()

	// Update the invoice
	if err := s.repo.UpdateShippingInvoice(ctx, invoice); err != nil {
		return nil, fmt.Errorf("failed to update shipping invoice: %w", err)
	}

	return invoice, nil
}

// DeleteShippingInvoice deletes a shipping invoice by ID.
func (s *shippingInvoiceService) DeleteShippingInvoice(ctx context.Context, id uuid.ID) error {
	if err := s.repo.DeleteShippingInvoice(ctx, id); err != nil {
		return fmt.Errorf("failed to delete shipping invoice: %w", err)
	}

	return nil
}

// PayShippingInvoice marks a shipping invoice as paid.
func (s *shippingInvoiceService) PayShippingInvoice(ctx context.Context, id uuid.ID, request *dtos.PayShippingInvoiceRequest) (*entities.ShippingInvoice, error) {
	// Get the existing invoice
	invoice, err := s.repo.GetShippingInvoiceByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get shipping invoice: %w", err)
	}

	// Mark as paid
	invoice.MarkAsPaid()

	// Update notes if provided
	if request.PaymentNotes != "" {
		invoice.Notes = fmt.Sprintf("%s\nPayment Method: %s\nPayment Notes: %s",
			invoice.Notes, request.PaymentMethod, request.PaymentNotes)
	}

	// Update the invoice
	if err := s.repo.UpdateShippingInvoice(ctx, invoice); err != nil {
		return nil, fmt.Errorf("failed to update shipping invoice: %w", err)
	}

	return invoice, nil
}

// GetOverdueShippingInvoices retrieves overdue shipping invoices.
func (s *shippingInvoiceService) GetOverdueShippingInvoices(ctx context.Context) ([]entities.ShippingInvoice, error) {
	invoices, err := s.repo.GetOverdueShippingInvoices(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get overdue shipping invoices: %w", err)
	}

	return invoices, nil
}

// GenerateInvoiceNumber generates a unique invoice number.
func (s *shippingInvoiceService) GenerateInvoiceNumber(ctx context.Context) (string, error) {
	now := time.Now()
	prefix := "SI" // Shipping Invoice
	datePart := now.Format("20060102")
	timePart := now.Format("150405")

	// Generate a simple incremental number (in a real system, you might want to use a sequence)
	invoiceNumber := fmt.Sprintf("%s%s%s", prefix, datePart, timePart)

	return invoiceNumber, nil
}
