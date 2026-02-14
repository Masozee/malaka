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
	if coa.AccountCode == "" {
		return fmt.Errorf("account code cannot be empty")
	}

	// Check if account code already exists within the same company
	existingCoa, err := s.repo.GetByCode(ctx, coa.CompanyID, coa.AccountCode)
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

// GetChartOfAccountByCode retrieves a ChartOfAccount by its account code within a company.
func (s *chartOfAccountService) GetChartOfAccountByCode(ctx context.Context, companyID string, code string) (*entities.ChartOfAccount, error) {
	return s.repo.GetByCode(ctx, companyID, code)
}

// GetAllChartOfAccounts retrieves all ChartOfAccounts for a company.
func (s *chartOfAccountService) GetAllChartOfAccounts(ctx context.Context, companyID string) ([]*entities.ChartOfAccount, error) {
	return s.repo.GetAll(ctx, companyID)
}

// UpdateChartOfAccount updates an existing ChartOfAccount.
func (s *chartOfAccountService) UpdateChartOfAccount(ctx context.Context, coa *entities.ChartOfAccount) error {
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

	// Check if updated account code conflicts with another existing account in the same company
	if existingCoa.AccountCode != coa.AccountCode {
		conflictCoa, err := s.repo.GetByCode(ctx, coa.CompanyID, coa.AccountCode)
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
	existingCoa, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check for existing account: %w", err)
	}
	if existingCoa == nil {
		return fmt.Errorf("account with ID %s not found", id)
	}

	return s.repo.Delete(ctx, id)
}
