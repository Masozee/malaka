package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/utils"
)

// ClassificationService provides business logic for classification operations.
type ClassificationService struct {
	repo repositories.ClassificationRepository
}

// NewClassificationService creates a new ClassificationService.
func NewClassificationService(repo repositories.ClassificationRepository) *ClassificationService {
	return &ClassificationService{repo: repo}
}

// CreateClassification creates a new classification.
func (s *ClassificationService) CreateClassification(ctx context.Context, classification *entities.Classification) error {
	if classification.ID == "" {
		classification.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, classification)
}

// GetClassificationByID retrieves a classification by its ID.
func (s *ClassificationService) GetClassificationByID(ctx context.Context, id string) (*entities.Classification, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllClassifications retrieves all classifications.
func (s *ClassificationService) GetAllClassifications(ctx context.Context) ([]*entities.Classification, error) {
	return s.repo.GetAll(ctx)
}

// UpdateClassification updates an existing classification.
func (s *ClassificationService) UpdateClassification(ctx context.Context, classification *entities.Classification) error {
	// Ensure the classification exists before updating
	existingClassification, err := s.repo.GetByID(ctx, classification.ID)
	if err != nil {
		return err
	}
	if existingClassification == nil {
		return errors.New("classification not found")
	}
	return s.repo.Update(ctx, classification)
}

// DeleteClassification deletes a classification by its ID.
func (s *ClassificationService) DeleteClassification(ctx context.Context, id string) error {
	// Ensure the classification exists before deleting
	existingClassification, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingClassification == nil {
		return errors.New("classification not found")
	}
	return s.repo.Delete(ctx, id)
}
