package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

// FinancialForecastService provides business logic for financial forecast operations.
type FinancialForecastService struct {
	repo repositories.FinancialForecastRepository
}

// NewFinancialForecastService creates a new FinancialForecastService.
func NewFinancialForecastService(repo repositories.FinancialForecastRepository) *FinancialForecastService {
	return &FinancialForecastService{repo: repo}
}

// CreateFinancialForecast creates a new financial forecast.
func (s *FinancialForecastService) CreateFinancialForecast(ctx context.Context, ff *entities.FinancialForecast) error {
	if ff.ID.IsNil() {
		ff.ID = uuid.New()
	}
	return s.repo.Create(ctx, ff)
}

// GetFinancialForecastByID retrieves a financial forecast by its ID.
func (s *FinancialForecastService) GetFinancialForecastByID(ctx context.Context, id uuid.ID) (*entities.FinancialForecast, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllFinancialForecasts retrieves all financial forecasts.
func (s *FinancialForecastService) GetAllFinancialForecasts(ctx context.Context) ([]*entities.FinancialForecast, error) {
	return s.repo.GetAll(ctx)
}

// UpdateFinancialForecast updates an existing financial forecast.
func (s *FinancialForecastService) UpdateFinancialForecast(ctx context.Context, ff *entities.FinancialForecast) error {
	// Ensure the financial forecast exists before updating
	existing, err := s.repo.GetByID(ctx, ff.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("financial forecast not found")
	}
	return s.repo.Update(ctx, ff)
}

// DeleteFinancialForecast deletes a financial forecast by its ID.
func (s *FinancialForecastService) DeleteFinancialForecast(ctx context.Context, id uuid.ID) error {
	// Ensure the financial forecast exists before deleting
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("financial forecast not found")
	}
	return s.repo.Delete(ctx, id)
}
