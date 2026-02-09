package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

// CashBankService provides business logic for cash/bank operations.
type CashBankService struct {
	repo repositories.CashBankRepository
}

// NewCashBankService creates a new CashBankService.
func NewCashBankService(repo repositories.CashBankRepository) *CashBankService {
	return &CashBankService{repo: repo}
}

// CreateCashBank creates a new cash/bank account.
func (s *CashBankService) CreateCashBank(ctx context.Context, cb *entities.CashBank) error {
	if cb.ID.IsNil() {
		cb.ID = uuid.New()
	}
	return s.repo.Create(ctx, cb)
}

// GetCashBankByID retrieves a cash/bank account by its ID.
func (s *CashBankService) GetCashBankByID(ctx context.Context, id uuid.ID) (*entities.CashBank, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateCashBank updates an existing cash/bank account.
func (s *CashBankService) UpdateCashBank(ctx context.Context, cb *entities.CashBank) error {
	// Ensure the cash/bank account exists before updating
	existingCB, err := s.repo.GetByID(ctx, cb.ID)
	if err != nil {
		return err
	}
	if existingCB == nil {
		return errors.New("cash/bank account not found")
	}
	return s.repo.Update(ctx, cb)
}

// DeleteCashBank deletes a cash/bank account by its ID.
func (s *CashBankService) DeleteCashBank(ctx context.Context, id uuid.ID) error {
	// Ensure the cash/bank account exists before deleting
	existingCB, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingCB == nil {
		return errors.New("cash/bank account not found")
	}
	return s.repo.Delete(ctx, id)
}
