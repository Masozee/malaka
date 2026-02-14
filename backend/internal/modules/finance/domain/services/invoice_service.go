package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

// InvoiceService provides business logic for invoice operations.
type InvoiceService struct {
	repo repositories.InvoiceRepository
}

// NewInvoiceService creates a new InvoiceService.
func NewInvoiceService(repo repositories.InvoiceRepository) *InvoiceService {
	return &InvoiceService{repo: repo}
}

// CreateInvoice creates a new invoice.
func (s *InvoiceService) CreateInvoice(ctx context.Context, invoice *entities.Invoice) error {
	if invoice.ID.IsNil() {
		invoice.ID = uuid.New()
	}
	return s.repo.Create(ctx, invoice)
}

// GetInvoiceByID retrieves an invoice by its ID.
func (s *InvoiceService) GetInvoiceByID(ctx context.Context, id uuid.ID) (*entities.Invoice, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllInvoices retrieves all invoices.
func (s *InvoiceService) GetAllInvoices(ctx context.Context) ([]*entities.Invoice, error) {
	return s.repo.GetAll(ctx)
}

// UpdateInvoice updates an existing invoice.
func (s *InvoiceService) UpdateInvoice(ctx context.Context, invoice *entities.Invoice) error {
	// Ensure the invoice exists before updating
	existingInvoice, err := s.repo.GetByID(ctx, invoice.ID)
	if err != nil {
		return err
	}
	if existingInvoice == nil {
		return errors.New("invoice not found")
	}
	return s.repo.Update(ctx, invoice)
}

// DeleteInvoice deletes an invoice by its ID.
func (s *InvoiceService) DeleteInvoice(ctx context.Context, id uuid.ID) error {
	// Ensure the invoice exists before deleting
	existingInvoice, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingInvoice == nil {
		return errors.New("invoice not found")
	}
	return s.repo.Delete(ctx, id)
}
