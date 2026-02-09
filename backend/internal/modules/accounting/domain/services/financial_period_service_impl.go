package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

// financialPeriodService implements FinancialPeriodService
type financialPeriodService struct {
	repo repositories.FinancialPeriodRepository
}

// NewFinancialPeriodService creates a new instance of FinancialPeriodService
func NewFinancialPeriodService(repo repositories.FinancialPeriodRepository) FinancialPeriodService {
	return &financialPeriodService{repo: repo}
}

// CreateFinancialPeriod creates a new financial period
func (s *financialPeriodService) CreateFinancialPeriod(ctx context.Context, period *entities.FinancialPeriod) error {
	if period.CompanyID == "" || period.FiscalYear == 0 {
		return errors.New("company ID and fiscal year are required")
	}

	if period.StartDate.IsZero() || period.EndDate.IsZero() {
		return errors.New("start date and end date are required")
	}

	if period.EndDate.Before(period.StartDate) {
		return errors.New("end date cannot be before start date")
	}

	period.Status = entities.FinancialPeriodStatusOpen
	period.IsClosed = false
	period.CreatedAt = time.Now()
	period.UpdatedAt = time.Now()

	return s.repo.Create(ctx, period)
}

// GetFinancialPeriodByID retrieves a financial period by its ID
func (s *financialPeriodService) GetFinancialPeriodByID(ctx context.Context, id uuid.ID) (*entities.FinancialPeriod, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllFinancialPeriods retrieves all financial periods
func (s *financialPeriodService) GetAllFinancialPeriods(ctx context.Context) ([]*entities.FinancialPeriod, error) {
	return s.repo.GetAll(ctx)
}

// UpdateFinancialPeriod updates an existing financial period
func (s *financialPeriodService) UpdateFinancialPeriod(ctx context.Context, period *entities.FinancialPeriod) error {
	existingPeriod, err := s.repo.GetByID(ctx, period.ID)
	if err != nil {
		return fmt.Errorf("failed to check for existing period: %w", err)
	}
	if existingPeriod == nil {
		return fmt.Errorf("financial period with ID %s not found", period.ID)
	}

	if existingPeriod.IsClosed {
		return errors.New("cannot update a closed financial period")
	}

	period.UpdatedAt = time.Now()
	return s.repo.Update(ctx, period)
}

// DeleteFinancialPeriod deletes a financial period by its ID
func (s *financialPeriodService) DeleteFinancialPeriod(ctx context.Context, id uuid.ID) error {
	existingPeriod, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check for existing period: %w", err)
	}
	if existingPeriod == nil {
		return fmt.Errorf("financial period with ID %s not found", id)
	}

	if existingPeriod.IsClosed {
		return errors.New("cannot delete a closed financial period")
	}

	return s.repo.Delete(ctx, id)
}

// GetFinancialPeriodsByCompany retrieves financial periods by company
func (s *financialPeriodService) GetFinancialPeriodsByCompany(ctx context.Context, companyID string) ([]*entities.FinancialPeriod, error) {
	return s.repo.GetByCompany(ctx, companyID)
}

// GetFinancialPeriodsByFiscalYear retrieves financial periods by fiscal year
func (s *financialPeriodService) GetFinancialPeriodsByFiscalYear(ctx context.Context, companyID string, fiscalYear int) ([]*entities.FinancialPeriod, error) {
	return s.repo.GetByFiscalYear(ctx, companyID, fiscalYear)
}

// GetCurrentFinancialPeriod retrieves the current financial period
func (s *financialPeriodService) GetCurrentFinancialPeriod(ctx context.Context, companyID string) (*entities.FinancialPeriod, error) {
	return s.repo.GetCurrent(ctx, companyID)
}

// GetOpenFinancialPeriods retrieves all open financial periods
func (s *financialPeriodService) GetOpenFinancialPeriods(ctx context.Context, companyID string) ([]*entities.FinancialPeriod, error) {
	return s.repo.GetOpenPeriods(ctx, companyID)
}

// GetClosedFinancialPeriods retrieves all closed financial periods
func (s *financialPeriodService) GetClosedFinancialPeriods(ctx context.Context, companyID string) ([]*entities.FinancialPeriod, error) {
	return s.repo.GetClosedPeriods(ctx, companyID)
}

// CloseFinancialPeriod marks a financial period as closed
func (s *financialPeriodService) CloseFinancialPeriod(ctx context.Context, id uuid.ID, userID string) error {
	period, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if period.IsClosed {
		return errors.New("financial period is already closed")
	}

	return s.repo.Close(ctx, id, userID)
}

// ReopenFinancialPeriod reopens a closed financial period
func (s *financialPeriodService) ReopenFinancialPeriod(ctx context.Context, id uuid.ID) error {
	period, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if !period.IsClosed {
		return errors.New("financial period is not closed")
	}

	return s.repo.Reopen(ctx, id)
}
