package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// ExpenditureRequestRepository defines the interface for expenditure request data access.
type ExpenditureRequestRepository interface {
	Create(ctx context.Context, request *entities.ExpenditureRequest) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.ExpenditureRequest, error)
	GetAll(ctx context.Context) ([]*entities.ExpenditureRequest, error)
	GetByRequestorID(ctx context.Context, requestorID string) ([]*entities.ExpenditureRequest, error)
	GetByStatus(ctx context.Context, status string) ([]*entities.ExpenditureRequest, error)
	GetByRequestNumber(ctx context.Context, requestNumber string) (*entities.ExpenditureRequest, error)
	Update(ctx context.Context, request *entities.ExpenditureRequest) error
	Delete(ctx context.Context, id uuid.ID) error
}
