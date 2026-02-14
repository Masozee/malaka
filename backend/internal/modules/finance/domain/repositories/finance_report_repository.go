package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// FinanceReportRepository defines the interface for finance report data operations.
type FinanceReportRepository interface {
	Create(ctx context.Context, fr *entities.FinanceReport) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.FinanceReport, error)
	GetAll(ctx context.Context) ([]*entities.FinanceReport, error)
	Update(ctx context.Context, fr *entities.FinanceReport) error
	Delete(ctx context.Context, id uuid.ID) error
}
