package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/uuid"
)

// ModelService provides business logic for model operations.
type ModelService struct {
	repo repositories.ModelRepository
}

// NewModelService creates a new ModelService.
func NewModelService(repo repositories.ModelRepository) *ModelService {
	return &ModelService{repo: repo}
}

// CreateModel creates a new model.
func (s *ModelService) CreateModel(ctx context.Context, model *entities.Model) error {
	if model.ID.IsNil() {
		model.ID = uuid.New()
	}
	return s.repo.Create(ctx, model)
}

// GetModelByID retrieves a model by its ID.
func (s *ModelService) GetModelByID(ctx context.Context, id uuid.ID) (*entities.Model, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllModels retrieves all models.
func (s *ModelService) GetAllModels(ctx context.Context) ([]*entities.Model, error) {
	return s.repo.GetAll(ctx)
}

// UpdateModel updates an existing model.
func (s *ModelService) UpdateModel(ctx context.Context, model *entities.Model) error {
	// Ensure the model exists before updating
	existingModel, err := s.repo.GetByID(ctx, model.ID)
	if err != nil {
		return err
	}
	if existingModel == nil {
		return errors.New("model not found")
	}
	return s.repo.Update(ctx, model)
}

// DeleteModel deletes a model by its ID.
func (s *ModelService) DeleteModel(ctx context.Context, id uuid.ID) error {
	// Ensure the model exists before deleting
	existingModel, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingModel == nil {
		return errors.New("model not found")
	}
	return s.repo.Delete(ctx, id)
}
