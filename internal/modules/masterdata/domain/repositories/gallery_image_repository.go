package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
)

// GalleryImageRepository defines the interface for gallery image data operations.
type GalleryImageRepository interface {
	Create(ctx context.Context, image *entities.GalleryImage) error
	GetByID(ctx context.Context, id string) (*entities.GalleryImage, error)
	GetAll(ctx context.Context) ([]*entities.GalleryImage, error)
	Update(ctx context.Context, image *entities.GalleryImage) error
	Delete(ctx context.Context, id string) error
	GetByArticleID(ctx context.Context, articleID string) ([]*entities.GalleryImage, error)
}
