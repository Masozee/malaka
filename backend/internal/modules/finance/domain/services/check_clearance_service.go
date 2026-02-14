package services

import (
	"context"
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

type CheckClearanceService interface {
	CreateCheckClearance(ctx context.Context, check *entities.CheckClearance) error
	GetCheckClearanceByID(ctx context.Context, id uuid.ID) (*entities.CheckClearance, error)
	GetAllCheckClearances(ctx context.Context) ([]*entities.CheckClearance, error)
	UpdateCheckClearance(ctx context.Context, check *entities.CheckClearance) error
	DeleteCheckClearance(ctx context.Context, id uuid.ID) error
	GetCheckClearancesByStatus(ctx context.Context, status string) ([]*entities.CheckClearance, error)
	ClearCheck(ctx context.Context, id uuid.ID, clearanceDate time.Time) error
	BounceCheck(ctx context.Context, id uuid.ID) error
}

type checkClearanceService struct {
	repo repositories.CheckClearanceRepository
}

func NewCheckClearanceService(repo repositories.CheckClearanceRepository) CheckClearanceService {
	return &checkClearanceService{
		repo: repo,
	}
}

func (s *checkClearanceService) CreateCheckClearance(ctx context.Context, check *entities.CheckClearance) error {
	if check.Status == "" {
		check.Status = "ISSUED"
	}
	return s.repo.Create(ctx, check)
}

func (s *checkClearanceService) GetCheckClearanceByID(ctx context.Context, id uuid.ID) (*entities.CheckClearance, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *checkClearanceService) GetAllCheckClearances(ctx context.Context) ([]*entities.CheckClearance, error) {
	return s.repo.GetAll(ctx)
}

func (s *checkClearanceService) UpdateCheckClearance(ctx context.Context, check *entities.CheckClearance) error {
	return s.repo.Update(ctx, check)
}

func (s *checkClearanceService) DeleteCheckClearance(ctx context.Context, id uuid.ID) error {
	return s.repo.Delete(ctx, id)
}

func (s *checkClearanceService) GetCheckClearancesByStatus(ctx context.Context, status string) ([]*entities.CheckClearance, error) {
	return s.repo.GetByStatus(ctx, status)
}

func (s *checkClearanceService) ClearCheck(ctx context.Context, id uuid.ID, clearanceDate time.Time) error {
	check, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	check.Status = "CLEARED"
	check.ClearanceDate = clearanceDate

	return s.repo.Update(ctx, check)
}

func (s *checkClearanceService) BounceCheck(ctx context.Context, id uuid.ID) error {
	check, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	check.Status = "BOUNCED"

	return s.repo.Update(ctx, check)
}
