package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

// BankTransferService provides business logic for bank transfer operations.
type BankTransferService struct {
	repo repositories.BankTransferRepository
}

// NewBankTransferService creates a new BankTransferService.
func NewBankTransferService(repo repositories.BankTransferRepository) *BankTransferService {
	return &BankTransferService{repo: repo}
}

// CreateBankTransfer creates a new bank transfer.
func (s *BankTransferService) CreateBankTransfer(ctx context.Context, bt *entities.BankTransfer) error {
	if bt.ID.IsNil() {
		bt.ID = uuid.New()
	}
	return s.repo.Create(ctx, bt)
}

// GetBankTransferByID retrieves a bank transfer by its ID.
func (s *BankTransferService) GetBankTransferByID(ctx context.Context, id uuid.ID) (*entities.BankTransfer, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateBankTransfer updates an existing bank transfer.
func (s *BankTransferService) UpdateBankTransfer(ctx context.Context, bt *entities.BankTransfer) error {
	// Ensure the bank transfer exists before updating
	existingBT, err := s.repo.GetByID(ctx, bt.ID)
	if err != nil {
		return err
	}
	if existingBT == nil {
		return errors.New("bank transfer not found")
	}
	return s.repo.Update(ctx, bt)
}

// DeleteBankTransfer deletes a bank transfer by its ID.
func (s *BankTransferService) DeleteBankTransfer(ctx context.Context, id uuid.ID) error {
	// Ensure the bank transfer exists before deleting
	existingBT, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingBT == nil {
		return errors.New("bank transfer not found")
	}
	return s.repo.Delete(ctx, id)
}
