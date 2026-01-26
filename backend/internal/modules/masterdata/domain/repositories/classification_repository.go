package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
)

// ClassificationRepository defines the interface for classification data operations.
type ClassificationRepository interface {
	Create(ctx context.Context, classification *entities.Classification) error
	GetByID(ctx context.Context, id string) (*entities.Classification, error)
	GetByCode(ctx context.Context, code string) (*entities.Classification, error)
	GetAll(ctx context.Context) ([]*entities.Classification, error)
	GetByParentID(ctx context.Context, parentID string) ([]*entities.Classification, error)
	GetRootClassifications(ctx context.Context) ([]*entities.Classification, error)
	Update(ctx context.Context, classification *entities.Classification) error
	Delete(ctx context.Context, id string) error
}
