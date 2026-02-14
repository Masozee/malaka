package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// LoanFacilityRepository defines the interface for loan facility data operations.
type LoanFacilityRepository interface {
	Create(ctx context.Context, lf *entities.LoanFacility) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.LoanFacility, error)
	GetAll(ctx context.Context) ([]*entities.LoanFacility, error)
	Update(ctx context.Context, lf *entities.LoanFacility) error
	Delete(ctx context.Context, id uuid.ID) error
}
