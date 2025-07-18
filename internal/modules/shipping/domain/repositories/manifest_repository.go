package repositories

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/shipping/domain/entities"
)

// ManifestRepository defines the interface for manifest data operations.
type ManifestRepository interface {
	Create(ctx context.Context, manifest *entities.Manifest) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Manifest, error)
	GetAll(ctx context.Context) ([]entities.Manifest, error)
	Update(ctx context.Context, manifest *entities.Manifest) error
	Delete(ctx context.Context, id uuid.UUID) error
}
