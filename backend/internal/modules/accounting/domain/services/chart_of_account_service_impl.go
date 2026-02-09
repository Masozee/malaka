package services

import (
	"context"
	"fmt"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
	"malaka/internal/shared/uuid"
)

// chartOfAccountService implements ChartOfAccountService.
type chartOfAccountService struct {
	repo repositories.ChartOfAccountRepository
}

// NewChartOfAccountService creates a new ChartOfAccountService.
func NewChartOfAccountService(repo repositories.ChartOfAccountRepository) ChartOfAccountService {
	return &chartOfAccountService{repo: repo}
}

// CreateChartOfAccount creates a new ChartOfAccount.
func (s *chartOfAccountService) CreateChartOfAccount(ctx context.Context, coa *entities.ChartOfAccount) error {
	// Add business logic/validation here before calling repository
	if coa.AccountCode == "" {
		return fmt.Errorf("account code cannot be empty")
	}

	// Check if account code already exists
	existingCoa, err := s.repo.GetByCode(ctx, coa.AccountCode)
	if err != nil {
		return fmt.Errorf("failed to check for existing account code: %w", err)
	}
	if existingCoa != nil {
		return fmt.Errorf("account with code %s already exists", coa.AccountCode)
	}

	return s.repo.Create(ctx, coa)
}

// GetChartOfAccountByID retrieves a ChartOfAccount by its ID.
func (s *chartOfAccountService) GetChartOfAccountByID(ctx context.Context, id uuid.ID) (*entities.ChartOfAccount, error) {
	return s.repo.GetByID(ctx, id)
}

// GetChartOfAccountByCode retrieves a ChartOfAccount by its account code.
func (s *chartOfAccountService) GetChartOfAccountByCode(ctx context.Context, code string) (*entities.ChartOfAccount, error) {
	return s.repo.GetByCode(ctx, code)
}

// GetAllChartOfAccounts retrieves all ChartOfAccounts.
func (s *chartOfAccountService) GetAllChartOfAccounts(ctx context.Context) ([]*entities.ChartOfAccount, error) {
	return s.repo.GetAll(ctx)
}

// UpdateChartOfAccount updates an existing ChartOfAccount.
func (s *chartOfAccountService) UpdateChartOfAccount(ctx context.Context, coa *entities.ChartOfAccount) error {
	// Add business logic/validation here before calling repository
	if coa.AccountCode == "" {
		return fmt.Errorf("account code cannot be empty")
	}

	// Ensure the COA exists before updating
	existingCoa, err := s.repo.GetByID(ctx, coa.ID)
	if err != nil {
		return fmt.Errorf("failed to check for existing account: %w", err)
	}
	if existingCoa == nil {
		return fmt.Errorf("account with ID %s not found", coa.ID)
	}

	// Check if updated account code conflicts with another existing account
	if existingCoa.AccountCode != coa.AccountCode {
		conflictCoa, err := s.repo.GetByCode(ctx, coa.AccountCode)
		if err != nil {
			return fmt.Errorf("failed to check for account code conflict: %w", err)
		}
		if conflictCoa != nil && conflictCoa.ID != coa.ID {
			return fmt.Errorf("account with code %s already exists", coa.AccountCode)
		}
	}

	return s.repo.Update(ctx, coa)
}

// DeleteChartOfAccount deletes a ChartOfAccount by its ID.
func (s *chartOfAccountService) DeleteChartOfAccount(ctx context.Context, id uuid.ID) error {
	// Ensure the COA exists before deleting
	existingCoa, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check for existing account: %w", err)
	}
	if existingCoa == nil {
		return fmt.Errorf("account with ID %s not found", id)
	}

	return s.repo.Delete(ctx, id)
}
