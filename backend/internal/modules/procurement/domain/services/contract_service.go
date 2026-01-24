package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
	"malaka/internal/shared/utils"
)

// ContractService provides business logic for contract operations.
type ContractService struct {
	repo repositories.ContractRepository
}

// NewContractService creates a new ContractService.
func NewContractService(repo repositories.ContractRepository) *ContractService {
	return &ContractService{repo: repo}
}

// Create creates a new contract.
func (s *ContractService) Create(ctx context.Context, contract *entities.Contract) error {
	if contract.ID == "" {
		contract.ID = uuid.New().String()
	}

	// Generate contract number
	if contract.ContractNumber == "" {
		number, err := s.repo.GetNextContractNumber(ctx)
		if err != nil {
			return fmt.Errorf("failed to generate contract number: %w", err)
		}
		contract.ContractNumber = number
	}

	// Validate dates
	if contract.EndDate.Before(contract.StartDate) {
		return errors.New("end date cannot be before start date")
	}

	// Set defaults
	if contract.Status == "" {
		contract.Status = entities.ContractStatusDraft
	}
	if contract.Currency == "" {
		contract.Currency = "IDR"
	}
	contract.CreatedAt = utils.Now()
	contract.UpdatedAt = utils.Now()

	return s.repo.Create(ctx, contract)
}

// GetByID retrieves a contract by its ID.
func (s *ContractService) GetByID(ctx context.Context, id string) (*entities.Contract, error) {
	contract, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if contract == nil {
		return nil, errors.New("contract not found")
	}
	return contract, nil
}

// GetAll retrieves all contracts with filters.
func (s *ContractService) GetAll(ctx context.Context, filter *repositories.ContractFilter) ([]*entities.Contract, int, error) {
	if filter == nil {
		filter = &repositories.ContractFilter{}
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 {
		filter.Limit = 10
	}
	return s.repo.GetAll(ctx, filter)
}

// Update updates an existing contract.
func (s *ContractService) Update(ctx context.Context, contract *entities.Contract) error {
	existing, err := s.repo.GetByID(ctx, contract.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("contract not found")
	}

	// Can only update draft contracts (or some fields of active contracts)
	if existing.Status != entities.ContractStatusDraft && existing.Status != entities.ContractStatusActive {
		return errors.New("can only update contracts in draft or active status")
	}

	// Validate dates
	if contract.EndDate.Before(contract.StartDate) {
		return errors.New("end date cannot be before start date")
	}

	contract.UpdatedAt = utils.Now()

	return s.repo.Update(ctx, contract)
}

// Delete deletes a contract (soft delete).
func (s *ContractService) Delete(ctx context.Context, id string) error {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("contract not found")
	}

	// Can only delete draft contracts
	if existing.Status != entities.ContractStatusDraft {
		return errors.New("can only delete contracts in draft status")
	}

	return s.repo.Delete(ctx, id)
}

// Activate activates a draft contract.
func (s *ContractService) Activate(ctx context.Context, id string) (*entities.Contract, error) {
	contract, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if contract == nil {
		return nil, errors.New("contract not found")
	}

	if !contract.CanBeActivated() {
		return nil, errors.New("contract cannot be activated in current status")
	}

	contract.Status = entities.ContractStatusActive
	contract.UpdatedAt = utils.Now()

	if err := s.repo.Update(ctx, contract); err != nil {
		return nil, err
	}

	return contract, nil
}

// Terminate terminates an active contract.
func (s *ContractService) Terminate(ctx context.Context, id string, reason string) (*entities.Contract, error) {
	contract, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if contract == nil {
		return nil, errors.New("contract not found")
	}

	if !contract.CanBeTerminated() {
		return nil, errors.New("contract cannot be terminated in current status")
	}

	contract.Status = entities.ContractStatusTerminated
	contract.UpdatedAt = utils.Now()

	if err := s.repo.Update(ctx, contract); err != nil {
		return nil, err
	}

	return contract, nil
}

// Renew renews a contract with a new end date.
func (s *ContractService) Renew(ctx context.Context, id string, newEndDate time.Time) (*entities.Contract, error) {
	contract, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if contract == nil {
		return nil, errors.New("contract not found")
	}

	if !contract.CanBeRenewed() {
		return nil, errors.New("contract cannot be renewed in current status")
	}

	// Validate new end date
	if newEndDate.Before(contract.EndDate) {
		return nil, errors.New("new end date must be after current end date")
	}

	// Update end date and set status to renewed then active
	contract.EndDate = newEndDate
	contract.Status = entities.ContractStatusActive
	contract.UpdatedAt = utils.Now()

	if err := s.repo.Update(ctx, contract); err != nil {
		return nil, err
	}

	return contract, nil
}

// GetExpiring retrieves contracts expiring within the specified days.
func (s *ContractService) GetExpiring(ctx context.Context, days int) ([]*entities.Contract, error) {
	if days <= 0 {
		days = 30 // default to 30 days
	}
	return s.repo.GetExpiring(ctx, days)
}

// GetBySupplierID retrieves all contracts for a supplier.
func (s *ContractService) GetBySupplierID(ctx context.Context, supplierID string) ([]*entities.Contract, error) {
	return s.repo.GetBySupplierID(ctx, supplierID)
}

// GetStats retrieves contract statistics.
func (s *ContractService) GetStats(ctx context.Context) (*repositories.ContractStats, error) {
	return s.repo.GetStats(ctx)
}

// ExpireContracts marks all contracts past their end date as expired.
// This can be called by a background job.
func (s *ContractService) ExpireContracts(ctx context.Context) (int, error) {
	// Get all active contracts
	filter := &repositories.ContractFilter{
		Status: entities.ContractStatusActive,
		Limit:  1000,
	}
	contracts, _, err := s.repo.GetAll(ctx, filter)
	if err != nil {
		return 0, err
	}

	count := 0
	for _, contract := range contracts {
		if contract.IsExpired() {
			contract.Status = entities.ContractStatusExpired
			contract.UpdatedAt = utils.Now()
			if err := s.repo.Update(ctx, contract); err != nil {
				continue // Log error but continue with other contracts
			}
			count++
		}
	}

	return count, nil
}
