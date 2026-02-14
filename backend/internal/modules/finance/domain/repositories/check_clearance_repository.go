package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// CheckClearanceRepository defines the interface for check clearance data access.
type CheckClearanceRepository interface {
	Create(ctx context.Context, check *entities.CheckClearance) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.CheckClearance, error)
	GetAll(ctx context.Context) ([]*entities.CheckClearance, error)
	GetByCheckNumber(ctx context.Context, checkNumber string) (*entities.CheckClearance, error)
	GetByStatus(ctx context.Context, status string) ([]*entities.CheckClearance, error)
	Update(ctx context.Context, check *entities.CheckClearance) error
	Delete(ctx context.Context, id uuid.ID) error
}
