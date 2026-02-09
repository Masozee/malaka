package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// ClassificationRepository defines the interface for classification data operations.
type ClassificationRepository interface {
	Create(ctx context.Context, classification *entities.Classification) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Classification, error)
	GetByCode(ctx context.Context, code string) (*entities.Classification, error)
	GetAll(ctx context.Context) ([]*entities.Classification, error)
	GetByParentID(ctx context.Context, parentID uuid.ID) ([]*entities.Classification, error)
	GetRootClassifications(ctx context.Context) ([]*entities.Classification, error)
	Update(ctx context.Context, classification *entities.Classification) error
	Delete(ctx context.Context, id uuid.ID) error
}
