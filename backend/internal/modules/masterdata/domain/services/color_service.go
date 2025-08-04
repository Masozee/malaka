package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
)

// ColorService provides business logic for color operations.
type ColorService struct {
	repo repositories.ColorRepository
}

// NewColorService creates a new ColorService.
func NewColorService(repo repositories.ColorRepository) *ColorService {
	return &ColorService{repo: repo}
}

// CreateColor creates a new color.
func (s *ColorService) CreateColor(ctx context.Context, color *entities.Color) error {
	// Let the database generate the UUID (gen_random_uuid())
	color.ID = ""
	return s.repo.Create(ctx, color)
}

// GetColorByID retrieves a color by its ID.
func (s *ColorService) GetColorByID(ctx context.Context, id string) (*entities.Color, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllColors retrieves all colors.
func (s *ColorService) GetAllColors(ctx context.Context) ([]*entities.Color, error) {
	return s.repo.GetAll(ctx)
}

// UpdateColor updates an existing color.
func (s *ColorService) UpdateColor(ctx context.Context, color *entities.Color) error {
	// Ensure the color exists before updating
	existingColor, err := s.repo.GetByID(ctx, color.ID)
	if err != nil {
		return err
	}
	if existingColor == nil {
		return errors.New("color not found")
	}
	return s.repo.Update(ctx, color)
}

// DeleteColor deletes a color by its ID.
func (s *ColorService) DeleteColor(ctx context.Context, id string) error {
	// Ensure the color exists before deleting
	existingColor, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingColor == nil {
		return errors.New("color not found")
	}
	return s.repo.Delete(ctx, id)
}
