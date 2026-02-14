package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

// FinanceReportService provides business logic for finance report operations.
type FinanceReportService struct {
	repo repositories.FinanceReportRepository
}

// NewFinanceReportService creates a new FinanceReportService.
func NewFinanceReportService(repo repositories.FinanceReportRepository) *FinanceReportService {
	return &FinanceReportService{repo: repo}
}

// CreateFinanceReport creates a new finance report.
func (s *FinanceReportService) CreateFinanceReport(ctx context.Context, fr *entities.FinanceReport) error {
	if fr.ID.IsNil() {
		fr.ID = uuid.New()
	}
	return s.repo.Create(ctx, fr)
}

// GetFinanceReportByID retrieves a finance report by its ID.
func (s *FinanceReportService) GetFinanceReportByID(ctx context.Context, id uuid.ID) (*entities.FinanceReport, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllFinanceReports retrieves all finance reports.
func (s *FinanceReportService) GetAllFinanceReports(ctx context.Context) ([]*entities.FinanceReport, error) {
	return s.repo.GetAll(ctx)
}

// UpdateFinanceReport updates an existing finance report.
func (s *FinanceReportService) UpdateFinanceReport(ctx context.Context, fr *entities.FinanceReport) error {
	// Ensure the finance report exists before updating
	existing, err := s.repo.GetByID(ctx, fr.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("finance report not found")
	}
	return s.repo.Update(ctx, fr)
}

// DeleteFinanceReport deletes a finance report by its ID.
func (s *FinanceReportService) DeleteFinanceReport(ctx context.Context, id uuid.ID) error {
	// Ensure the finance report exists before deleting
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("finance report not found")
	}
	return s.repo.Delete(ctx, id)
}
