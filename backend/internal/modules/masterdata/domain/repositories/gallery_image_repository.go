package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// GalleryImageRepository defines the interface for gallery image data operations.
type GalleryImageRepository interface {
	Create(ctx context.Context, image *entities.GalleryImage) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.GalleryImage, error)
	GetAll(ctx context.Context) ([]*entities.GalleryImage, error)
	Update(ctx context.Context, image *entities.GalleryImage) error
	Delete(ctx context.Context, id uuid.ID) error
	GetByArticleID(ctx context.Context, articleID uuid.ID) ([]*entities.GalleryImage, error)
}
