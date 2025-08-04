package infrastructure

import (
	"context"
	"malaka/internal/modules/accounting/domain"
)

// CostCenterRepository defines the interface for cost center data operations.
type CostCenterRepository interface {
	Save(ctx context.Context, costCenter *domain.CostCenter) error
	FindByID(ctx context.Context, id string) (*domain.CostCenter, error)
	FindAll(ctx context.Context) ([]*domain.CostCenter, error)
	Update(ctx context.Context, costCenter *domain.CostCenter) error
	Delete(ctx context.Context, id string) error
}
