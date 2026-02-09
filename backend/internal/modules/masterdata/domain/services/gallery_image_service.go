package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/uuid"
)

// GalleryImageService provides business logic for gallery image operations.
type GalleryImageService struct {
	repo repositories.GalleryImageRepository
}

// NewGalleryImageService creates a new GalleryImageService.
func NewGalleryImageService(repo repositories.GalleryImageRepository) *GalleryImageService {
	return &GalleryImageService{repo: repo}
}

// CreateGalleryImage creates a new gallery image.
func (s *GalleryImageService) CreateGalleryImage(ctx context.Context, image *entities.GalleryImage) error {
	if image.ID.IsNil() {
		image.ID = uuid.New()
	}
	return s.repo.Create(ctx, image)
}

// GetGalleryImageByID retrieves a gallery image by its ID.
func (s *GalleryImageService) GetGalleryImageByID(ctx context.Context, id uuid.ID) (*entities.GalleryImage, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllGalleryImages retrieves all gallery images.
func (s *GalleryImageService) GetAllGalleryImages(ctx context.Context) ([]*entities.GalleryImage, error) {
	return s.repo.GetAll(ctx)
}

// UpdateGalleryImage updates an existing gallery image.
func (s *GalleryImageService) UpdateGalleryImage(ctx context.Context, image *entities.GalleryImage) error {
	// Ensure the image exists before updating
	existingImage, err := s.repo.GetByID(ctx, image.ID)
	if err != nil {
		return err
	}
	if existingImage == nil {
		return errors.New("gallery image not found")
	}
	return s.repo.Update(ctx, image)
}

// DeleteGalleryImage deletes a gallery image by its ID.
func (s *GalleryImageService) DeleteGalleryImage(ctx context.Context, id uuid.ID) error {
	// Ensure the image exists before deleting
	existingImage, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingImage == nil {
		return errors.New("gallery image not found")
	}
	return s.repo.Delete(ctx, id)
}

// GetGalleryImagesByArticleID retrieves all gallery images for a given article ID.
func (s *GalleryImageService) GetGalleryImagesByArticleID(ctx context.Context, articleID uuid.ID) ([]*entities.GalleryImage, error) {
	return s.repo.GetByArticleID(ctx, articleID)
}
