package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

// CapexProjectService provides business logic for capex project operations.
type CapexProjectService struct {
	repo repositories.CapexProjectRepository
}

// NewCapexProjectService creates a new CapexProjectService.
func NewCapexProjectService(repo repositories.CapexProjectRepository) *CapexProjectService {
	return &CapexProjectService{repo: repo}
}

// CreateCapexProject creates a new capex project.
func (s *CapexProjectService) CreateCapexProject(ctx context.Context, cp *entities.CapexProject) error {
	if cp.ID.IsNil() {
		cp.ID = uuid.New()
	}
	return s.repo.Create(ctx, cp)
}

// GetCapexProjectByID retrieves a capex project by its ID.
func (s *CapexProjectService) GetCapexProjectByID(ctx context.Context, id uuid.ID) (*entities.CapexProject, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllCapexProjects retrieves all capex projects.
func (s *CapexProjectService) GetAllCapexProjects(ctx context.Context) ([]*entities.CapexProject, error) {
	return s.repo.GetAll(ctx)
}

// UpdateCapexProject updates an existing capex project.
func (s *CapexProjectService) UpdateCapexProject(ctx context.Context, cp *entities.CapexProject) error {
	// Ensure the capex project exists before updating
	existingCP, err := s.repo.GetByID(ctx, cp.ID)
	if err != nil {
		return err
	}
	if existingCP == nil {
		return errors.New("capex project not found")
	}
	return s.repo.Update(ctx, cp)
}

// DeleteCapexProject deletes a capex project by its ID.
func (s *CapexProjectService) DeleteCapexProject(ctx context.Context, id uuid.ID) error {
	// Ensure the capex project exists before deleting
	existingCP, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingCP == nil {
		return errors.New("capex project not found")
	}
	return s.repo.Delete(ctx, id)
}
