package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

// LoanFacilityService provides business logic for loan facility operations.
type LoanFacilityService struct {
	repo repositories.LoanFacilityRepository
}

// NewLoanFacilityService creates a new LoanFacilityService.
func NewLoanFacilityService(repo repositories.LoanFacilityRepository) *LoanFacilityService {
	return &LoanFacilityService{repo: repo}
}

// CreateLoanFacility creates a new loan facility.
func (s *LoanFacilityService) CreateLoanFacility(ctx context.Context, lf *entities.LoanFacility) error {
	if lf.ID.IsNil() {
		lf.ID = uuid.New()
	}
	return s.repo.Create(ctx, lf)
}

// GetLoanFacilityByID retrieves a loan facility by its ID.
func (s *LoanFacilityService) GetLoanFacilityByID(ctx context.Context, id uuid.ID) (*entities.LoanFacility, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllLoanFacilities retrieves all loan facilities.
func (s *LoanFacilityService) GetAllLoanFacilities(ctx context.Context) ([]*entities.LoanFacility, error) {
	return s.repo.GetAll(ctx)
}

// UpdateLoanFacility updates an existing loan facility.
func (s *LoanFacilityService) UpdateLoanFacility(ctx context.Context, lf *entities.LoanFacility) error {
	// Ensure the loan facility exists before updating
	existing, err := s.repo.GetByID(ctx, lf.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("loan facility not found")
	}
	return s.repo.Update(ctx, lf)
}

// DeleteLoanFacility deletes a loan facility by its ID.
func (s *LoanFacilityService) DeleteLoanFacility(ctx context.Context, id uuid.ID) error {
	// Ensure the loan facility exists before deleting
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("loan facility not found")
	}
	return s.repo.Delete(ctx, id)
}
