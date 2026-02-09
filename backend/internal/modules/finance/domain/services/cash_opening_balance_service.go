package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

// CashOpeningBalanceService provides business logic for cash opening balance operations.
type CashOpeningBalanceService struct {
	repo repositories.CashOpeningBalanceRepository
}

// NewCashOpeningBalanceService creates a new CashOpeningBalanceService.
func NewCashOpeningBalanceService(repo repositories.CashOpeningBalanceRepository) *CashOpeningBalanceService {
	return &CashOpeningBalanceService{repo: repo}
}

// CreateCashOpeningBalance creates a new cash opening balance.
func (s *CashOpeningBalanceService) CreateCashOpeningBalance(ctx context.Context, balance *entities.CashOpeningBalance) error {
	if balance.ID.IsNil() {
		balance.ID = uuid.New()
	}
	return s.repo.Create(ctx, balance)
}

// GetCashOpeningBalanceByID retrieves a cash opening balance by its ID.
func (s *CashOpeningBalanceService) GetCashOpeningBalanceByID(ctx context.Context, id uuid.ID) (*entities.CashOpeningBalance, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllCashOpeningBalances retrieves all cash opening balances.
func (s *CashOpeningBalanceService) GetAllCashOpeningBalances(ctx context.Context) ([]*entities.CashOpeningBalance, error) {
	return s.repo.GetAll(ctx)
}

// UpdateCashOpeningBalance updates an existing cash opening balance.
func (s *CashOpeningBalanceService) UpdateCashOpeningBalance(ctx context.Context, balance *entities.CashOpeningBalance) error {
	existingBalance, err := s.repo.GetByID(ctx, balance.ID)
	if err != nil {
		return err
	}
	if existingBalance == nil {
		return errors.New("cash opening balance not found")
	}
	return s.repo.Update(ctx, balance)
}

// DeleteCashOpeningBalance deletes a cash opening balance by its ID.
func (s *CashOpeningBalanceService) DeleteCashOpeningBalance(ctx context.Context, id uuid.ID) error {
	existingBalance, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingBalance == nil {
		return errors.New("cash opening balance not found")
	}
	return s.repo.Delete(ctx, id)
}
