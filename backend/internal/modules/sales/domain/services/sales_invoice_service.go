package services

import (
	"context"
	"errors"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
	"malaka/internal/shared/uuid"
)

// SalesInvoiceService provides business logic for sales invoice operations.
type SalesInvoiceService interface {
	CreateSalesInvoice(ctx context.Context, invoice *entities.SalesInvoice, items []*entities.SalesInvoiceItem) error
	GetAllSalesInvoices(ctx context.Context) ([]*entities.SalesInvoice, error)
	GetSalesInvoiceByID(ctx context.Context, id string) (*entities.SalesInvoice, error)
	UpdateSalesInvoice(ctx context.Context, invoice *entities.SalesInvoice) error
	DeleteSalesInvoice(ctx context.Context, id string) error
}



type salesInvoiceServiceImpl struct {
	repo     repositories.SalesInvoiceRepository
	itemRepo repositories.SalesInvoiceItemRepository
}

func NewSalesInvoiceService(repo repositories.SalesInvoiceRepository, itemRepo repositories.SalesInvoiceItemRepository) SalesInvoiceService {
	return &salesInvoiceServiceImpl{
		repo:     repo,
		itemRepo: itemRepo,
	}
}

func (s *salesInvoiceServiceImpl) CreateSalesInvoice(ctx context.Context, invoice *entities.SalesInvoice, items []*entities.SalesInvoiceItem) error {
	if invoice.ID.IsNil() {
		invoice.ID = uuid.New()
	}

	// Calculate tax and grand total (example: 10% PPN)
	invoice.TaxAmount = invoice.TotalAmount * 0.10 // PPN
	invoice.GrandTotal = invoice.TotalAmount + invoice.TaxAmount

	// Create the sales invoice
	if err := s.repo.Create(ctx, invoice); err != nil {
		return err
	}

	for _, item := range items {
		item.SalesInvoiceID = invoice.ID.String()
		if item.ID.IsNil() {
			item.ID = uuid.New()
		}
		// Create sales invoice item
		if err := s.itemRepo.Create(ctx, item); err != nil {
			return err
		}
	}

	return nil
}

func (s *salesInvoiceServiceImpl) GetAllSalesInvoices(ctx context.Context) ([]*entities.SalesInvoice, error) {
	return s.repo.GetAll(ctx)
}

func (s *salesInvoiceServiceImpl) GetSalesInvoiceByID(ctx context.Context, id string) (*entities.SalesInvoice, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *salesInvoiceServiceImpl) UpdateSalesInvoice(ctx context.Context, invoice *entities.SalesInvoice) error {
	// Ensure the sales invoice exists before updating
	existingInvoice, err := s.repo.GetByID(ctx, invoice.ID.String())
	if err != nil {
		return err
	}
	if existingInvoice == nil {
		return errors.New("sales invoice not found")
	}

	// Recalculate tax and grand total
	invoice.TaxAmount = invoice.TotalAmount * 0.10 // PPN
	invoice.GrandTotal = invoice.TotalAmount + invoice.TaxAmount

	return s.repo.Update(ctx, invoice)
}

func (s *salesInvoiceServiceImpl) DeleteSalesInvoice(ctx context.Context, id string) error {
	// Ensure the sales invoice exists before deleting
	existingInvoice, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingInvoice == nil {
		return errors.New("sales invoice not found")
	}
	return s.repo.Delete(ctx, id)
}

