package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
)

// DivisionService provides business logic for division operations.
type DivisionService struct {
	repo repositories.DivisionRepository
}

// NewDivisionService creates a new DivisionService.
func NewDivisionService(repo repositories.DivisionRepository) *DivisionService {
	return &DivisionService{repo: repo}
}

// CreateDivision creates a new division.
func (s *DivisionService) CreateDivision(ctx context.Context, division *entities.Division) error {
	division.ID = uuid.New()
	division.CreatedAt = time.Now()
	division.UpdatedAt = time.Now()

	// Calculate level based on parent
	if division.ParentID != nil {
		parent, err := s.repo.GetByID(ctx, *division.ParentID)
		if err != nil {
			return err
		}
		division.Level = parent.Level + 1
	} else {
		division.Level = 1
	}

	return s.repo.Create(ctx, division)
}

// GetDivisionByID retrieves a division by its ID.
func (s *DivisionService) GetDivisionByID(ctx context.Context, id uuid.UUID) (*entities.Division, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllDivisions retrieves all divisions.
func (s *DivisionService) GetAllDivisions(ctx context.Context) ([]*entities.Division, error) {
	return s.repo.GetAll(ctx)
}

// GetAllDivisionsWithPagination retrieves divisions with pagination and filtering.
func (s *DivisionService) GetAllDivisionsWithPagination(ctx context.Context, limit, offset int, search, status, sortOrder string) ([]*entities.Division, int, error) {
	return s.repo.GetAllWithPagination(ctx, limit, offset, search, status, sortOrder)
}

// GetDivisionByCode retrieves a division by its code.
func (s *DivisionService) GetDivisionByCode(ctx context.Context, code string) (*entities.Division, error) {
	return s.repo.GetByCode(ctx, code)
}

// GetDivisionsByParentID retrieves all divisions under a parent division.
func (s *DivisionService) GetDivisionsByParentID(ctx context.Context, parentID uuid.UUID) ([]*entities.Division, error) {
	return s.repo.GetByParentID(ctx, parentID)
}

// GetRootDivisions retrieves all root divisions (level 1).
func (s *DivisionService) GetRootDivisions(ctx context.Context) ([]*entities.Division, error) {
	return s.repo.GetRootDivisions(ctx)
}

// UpdateDivision updates an existing division.
func (s *DivisionService) UpdateDivision(ctx context.Context, division *entities.Division) error {
	division.UpdatedAt = time.Now()

	// Recalculate level if parent changed
	if division.ParentID != nil {
		parent, err := s.repo.GetByID(ctx, *division.ParentID)
		if err != nil {
			return err
		}
		division.Level = parent.Level + 1
	} else {
		division.Level = 1
	}

	return s.repo.Update(ctx, division)
}

// DeleteDivision deletes a division by its ID.
func (s *DivisionService) DeleteDivision(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}