package services

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
)

type ProsesMarginService interface {
	CreateProsesMargin(ctx context.Context, pm *entities.ProsesMargin) error
	GetProsesMarginByID(ctx context.Context, id string) (*entities.ProsesMargin, error)
	GetAllProsesMargins(ctx context.Context) ([]*entities.ProsesMargin, error)
	UpdateProsesMargin(ctx context.Context, pm *entities.ProsesMargin) error
	DeleteProsesMargin(ctx context.Context, id string) error
}

// ProsesMarginService provides business logic for proses margin operations.
type prosesMarginService struct {
	repo repositories.ProsesMarginRepository
}

// NewProsesMarginService creates a new ProsesMarginService.
func NewProsesMarginService(repo repositories.ProsesMarginRepository) ProsesMarginService {
	return &prosesMarginService{repo: repo}
}

// CreateProsesMargin creates a new proses margin entry.
func (s *prosesMarginService) CreateProsesMargin(ctx context.Context, pm *entities.ProsesMargin) error {
	if pm.ID == "" {
		pm.ID = uuid.New().String()
	}
	return s.repo.Create(ctx, pm)
}

// GetProsesMarginByID retrieves a proses margin entry by its ID.
func (s *prosesMarginService) GetProsesMarginByID(ctx context.Context, id string) (*entities.ProsesMargin, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllProsesMargins retrieves all proses margin entries.
func (s *prosesMarginService) GetAllProsesMargins(ctx context.Context) ([]*entities.ProsesMargin, error) {
	return s.repo.GetAll(ctx)
}

// UpdateProsesMargin updates an existing proses margin entry.
func (s *prosesMarginService) UpdateProsesMargin(ctx context.Context, pm *entities.ProsesMargin) error {
	// Ensure the proses margin entry exists before updating
	existingPM, err := s.repo.GetByID(ctx, pm.ID)
	if err != nil {
		return err
	}
	if existingPM == nil {
		return errors.New("proses margin entry not found")
	}
	return s.repo.Update(ctx, pm)
}

// DeleteProsesMargin deletes a proses margin entry by its ID.
func (s *prosesMarginService) DeleteProsesMargin(ctx context.Context, id string) error {
	// Ensure the proses margin entry exists before deleting
	existingPM, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingPM == nil {
		return errors.New("proses margin entry not found")
	}
	return s.repo.Delete(ctx, id)
}
