package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
)

// MonthlyClosingRepository defines the interface for monthly closing data access.
type MonthlyClosingRepository interface {
	Create(ctx context.Context, closing *entities.MonthlyClosing) error
	GetByID(ctx context.Context, id string) (*entities.MonthlyClosing, error)
	GetAll(ctx context.Context) ([]*entities.MonthlyClosing, error)
	GetByMonth(ctx context.Context, month, year int) (*entities.MonthlyClosing, error)
	GetByYear(ctx context.Context, year int) ([]*entities.MonthlyClosing, error)
	GetByStatus(ctx context.Context, status string) ([]*entities.MonthlyClosing, error)
	Update(ctx context.Context, closing *entities.MonthlyClosing) error
	Delete(ctx context.Context, id string) error
}