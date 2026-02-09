package domain

import (
	"context"

	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

type ManifestService interface {
	CreateManifest(ctx context.Context, req *dtos.CreateManifestRequest) error
	GetManifestByID(ctx context.Context, id uuid.ID) (*entities.Manifest, error)
	GetAllManifests(ctx context.Context) ([]entities.Manifest, error)
	UpdateManifest(ctx context.Context, req *dtos.UpdateManifestRequest) error
	DeleteManifest(ctx context.Context, id uuid.ID) error
}
