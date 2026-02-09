package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

// CashReceiptService provides business logic for cash receipt operations.
type CashReceiptService struct {
	repo repositories.CashReceiptRepository
}

// NewCashReceiptService creates a new CashReceiptService.
func NewCashReceiptService(repo repositories.CashReceiptRepository) *CashReceiptService {
	return &CashReceiptService{repo: repo}
}

// CreateCashReceipt creates a new cash receipt.
func (s *CashReceiptService) CreateCashReceipt(ctx context.Context, cr *entities.CashReceipt) error {
	if cr.ID.IsNil() {
		cr.ID = uuid.New()
	}
	return s.repo.Create(ctx, cr)
}

// GetCashReceiptByID retrieves a cash receipt by its ID.
func (s *CashReceiptService) GetCashReceiptByID(ctx context.Context, id uuid.ID) (*entities.CashReceipt, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateCashReceipt updates an existing cash receipt.
func (s *CashReceiptService) UpdateCashReceipt(ctx context.Context, cr *entities.CashReceipt) error {
	// Ensure the cash receipt exists before updating
	existingCR, err := s.repo.GetByID(ctx, cr.ID)
	if err != nil {
		return err
	}
	if existingCR == nil {
		return errors.New("cash receipt not found")
	}
	return s.repo.Update(ctx, cr)
}

// DeleteCashReceipt deletes a cash receipt by its ID.
func (s *CashReceiptService) DeleteCashReceipt(ctx context.Context, id uuid.ID) error {
	// Ensure the cash receipt exists before deleting
	existingCR, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingCR == nil {
		return errors.New("cash receipt not found")
	}
	return s.repo.Delete(ctx, id)
}
