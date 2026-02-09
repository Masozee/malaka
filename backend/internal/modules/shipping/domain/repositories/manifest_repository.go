package repositories

import (
	"context"

	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

// ManifestRepository defines the interface for manifest data operations.
type ManifestRepository interface {
	Create(ctx context.Context, manifest *entities.Manifest) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Manifest, error)
	GetAll(ctx context.Context) ([]entities.Manifest, error)
	Update(ctx context.Context, manifest *entities.Manifest) error
	Delete(ctx context.Context, id uuid.ID) error
}
