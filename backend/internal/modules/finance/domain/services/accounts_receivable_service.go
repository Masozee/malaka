package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/utils"
)

// AccountsReceivableService provides business logic for accounts receivable operations.
type AccountsReceivableService struct {
	repo repositories.AccountsReceivableRepository
}

// NewAccountsReceivableService creates a new AccountsReceivableService.
func NewAccountsReceivableService(repo repositories.AccountsReceivableRepository) *AccountsReceivableService {
	return &AccountsReceivableService{repo: repo}
}

// CreateAccountsReceivable creates a new accounts receivable record.
func (s *AccountsReceivableService) CreateAccountsReceivable(ctx context.Context, ar *entities.AccountsReceivable) error {
	if ar.ID == "" {
		ar.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, ar)
}

// GetAccountsReceivableByID retrieves an accounts receivable record by its ID.
func (s *AccountsReceivableService) GetAccountsReceivableByID(ctx context.Context, id string) (*entities.AccountsReceivable, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateAccountsReceivable updates an existing accounts receivable record.
func (s *AccountsReceivableService) UpdateAccountsReceivable(ctx context.Context, ar *entities.AccountsReceivable) error {
	// Ensure the accounts receivable record exists before updating
	existingAR, err := s.repo.GetByID(ctx, ar.ID)
	if err != nil {
		return err
	}
	if existingAR == nil {
		return errors.New("accounts receivable not found")
	}
	return s.repo.Update(ctx, ar)
}

// DeleteAccountsReceivable deletes an accounts receivable record by its ID.
func (s *AccountsReceivableService) DeleteAccountsReceivable(ctx context.Context, id string) error {
	// Ensure the accounts receivable record exists before deleting
	existingAR, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingAR == nil {
		return errors.New("accounts receivable not found")
	}
	return s.repo.Delete(ctx, id)
}
