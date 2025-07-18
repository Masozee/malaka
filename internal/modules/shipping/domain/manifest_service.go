package domain

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
)

type ManifestService interface {
	CreateManifest(ctx context.Context, req *dtos.CreateManifestRequest) error
	GetManifestByID(ctx context.Context, id uuid.UUID) (*entities.Manifest, error)
	GetAllManifests(ctx context.Context) ([]entities.Manifest, error)
	UpdateManifest(ctx context.Context, req *dtos.UpdateManifestRequest) error
	DeleteManifest(ctx context.Context, id uuid.UUID) error
}
