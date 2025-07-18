package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/utils"
)

// CashDisbursementService provides business logic for cash disbursement operations.
type CashDisbursementService struct {
	repo repositories.CashDisbursementRepository
}

// NewCashDisbursementService creates a new CashDisbursementService.
func NewCashDisbursementService(repo repositories.CashDisbursementRepository) *CashDisbursementService {
	return &CashDisbursementService{repo: repo}
}

// CreateCashDisbursement creates a new cash disbursement.
func (s *CashDisbursementService) CreateCashDisbursement(ctx context.Context, cd *entities.CashDisbursement) error {
	if cd.ID == "" {
		cd.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, cd)
}

// GetCashDisbursementByID retrieves a cash disbursement by its ID.
func (s *CashDisbursementService) GetCashDisbursementByID(ctx context.Context, id string) (*entities.CashDisbursement, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateCashDisbursement updates an existing cash disbursement.
func (s *CashDisbursementService) UpdateCashDisbursement(ctx context.Context, cd *entities.CashDisbursement) error {
	// Ensure the cash disbursement exists before updating
	existingCD, err := s.repo.GetByID(ctx, cd.ID)
	if err != nil {
		return err
	}
	if existingCD == nil {
		return errors.New("cash disbursement not found")
	}
	return s.repo.Update(ctx, cd)
}

// DeleteCashDisbursement deletes a cash disbursement by its ID.
func (s *CashDisbursementService) DeleteCashDisbursement(ctx context.Context, id string) error {
	// Ensure the cash disbursement exists before deleting
	existingCD, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingCD == nil {
		return errors.New("cash disbursement not found")
	}
	return s.repo.Delete(ctx, id)
}
