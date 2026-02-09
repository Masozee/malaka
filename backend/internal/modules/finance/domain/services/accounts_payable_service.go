package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

// AccountsPayableService provides business logic for accounts payable operations.
type AccountsPayableService struct {
	repo repositories.AccountsPayableRepository
}

// NewAccountsPayableService creates a new AccountsPayableService.
func NewAccountsPayableService(repo repositories.AccountsPayableRepository) *AccountsPayableService {
	return &AccountsPayableService{repo: repo}
}

// CreateAccountsPayable creates a new accounts payable record.
func (s *AccountsPayableService) CreateAccountsPayable(ctx context.Context, ap *entities.AccountsPayable) error {
	if ap.ID.IsNil() {
		ap.ID = uuid.New()
	}
	return s.repo.Create(ctx, ap)
}

// GetAccountsPayableByID retrieves an accounts payable record by its ID.
func (s *AccountsPayableService) GetAccountsPayableByID(ctx context.Context, id uuid.ID) (*entities.AccountsPayable, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateAccountsPayable updates an existing accounts payable record.
func (s *AccountsPayableService) UpdateAccountsPayable(ctx context.Context, ap *entities.AccountsPayable) error {
	// Ensure the accounts payable record exists before updating
	existingAP, err := s.repo.GetByID(ctx, ap.ID)
	if err != nil {
		return err
	}
	if existingAP == nil {
		return errors.New("accounts payable not found")
	}
	return s.repo.Update(ctx, ap)
}

// DeleteAccountsPayable deletes an accounts payable record by its ID.
func (s *AccountsPayableService) DeleteAccountsPayable(ctx context.Context, id uuid.ID) error {
	// Ensure the accounts payable record exists before deleting
	existingAP, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingAP == nil {
		return errors.New("accounts payable not found")
	}
	return s.repo.Delete(ctx, id)
}
