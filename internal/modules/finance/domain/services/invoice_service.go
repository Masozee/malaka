package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/utils"
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
	if invoice.ID == "" {
		invoice.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, invoice)
}

// GetInvoiceByID retrieves an invoice by its ID.
func (s *InvoiceService) GetInvoiceByID(ctx context.Context, id string) (*entities.Invoice, error) {
	return s.repo.GetByID(ctx, id)
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
func (s *InvoiceService) DeleteInvoice(ctx context.Context, id string) error {
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
