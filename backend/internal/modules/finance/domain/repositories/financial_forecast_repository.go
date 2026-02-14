package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// FinancialForecastRepository defines the interface for financial forecast data operations.
type FinancialForecastRepository interface {
	Create(ctx context.Context, ff *entities.FinancialForecast) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.FinancialForecast, error)
	GetAll(ctx context.Context) ([]*entities.FinancialForecast, error)
	Update(ctx context.Context, ff *entities.FinancialForecast) error
	Delete(ctx context.Context, id uuid.ID) error
}
