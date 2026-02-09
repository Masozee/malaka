package repositories

import (
	"context"

	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

// TrackingRepository defines the interface for tracking data operations.
type TrackingRepository interface {
	Create(ctx context.Context, tracking *entities.Tracking) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Tracking, error)
	Update(ctx context.Context, tracking *entities.Tracking) error
	Delete(ctx context.Context, id uuid.ID) error
}
