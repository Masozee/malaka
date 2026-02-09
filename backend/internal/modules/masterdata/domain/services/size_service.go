package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/uuid"
)

// SizeService provides business logic for size operations.
type SizeService struct {
	repo repositories.SizeRepository
}

// NewSizeService creates a new SizeService.
func NewSizeService(repo repositories.SizeRepository) *SizeService {
	return &SizeService{repo: repo}
}

// CreateSize creates a new size.
func (s *SizeService) CreateSize(ctx context.Context, size *entities.Size) error {
	if size.ID.IsNil() {
		size.ID = uuid.New()
	}
	return s.repo.Create(ctx, size)
}

// GetSizeByID retrieves a size by its ID.
func (s *SizeService) GetSizeByID(ctx context.Context, id uuid.ID) (*entities.Size, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllSizes retrieves all sizes.
func (s *SizeService) GetAllSizes(ctx context.Context) ([]*entities.Size, error) {
	return s.repo.GetAll(ctx)
}

// UpdateSize updates an existing size.
func (s *SizeService) UpdateSize(ctx context.Context, size *entities.Size) error {
	// Ensure the size exists before updating
	existingSize, err := s.repo.GetByID(ctx, size.ID)
	if err != nil {
		return err
	}
	if existingSize == nil {
		return errors.New("size not found")
	}
	return s.repo.Update(ctx, size)
}

// DeleteSize deletes a size by its ID.
func (s *SizeService) DeleteSize(ctx context.Context, id uuid.ID) error {
	// Ensure the size exists before deleting
	existingSize, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingSize == nil {
		return errors.New("size not found")
	}
	return s.repo.Delete(ctx, id)
}
