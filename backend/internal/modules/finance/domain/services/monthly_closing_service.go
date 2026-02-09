package services

import (
	"context"
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

type MonthlyClosingService interface {
	CreateMonthlyClosing(ctx context.Context, closing *entities.MonthlyClosing) error
	GetMonthlyClosingByID(ctx context.Context, id uuid.ID) (*entities.MonthlyClosing, error)
	GetAllMonthlyClosings(ctx context.Context) ([]*entities.MonthlyClosing, error)
	UpdateMonthlyClosing(ctx context.Context, closing *entities.MonthlyClosing) error
	DeleteMonthlyClosing(ctx context.Context, id uuid.ID) error
	GetMonthlyClosingByPeriod(ctx context.Context, month, year int) (*entities.MonthlyClosing, error)
	CloseMonth(ctx context.Context, id uuid.ID, closedBy uuid.ID) error
	LockClosing(ctx context.Context, id uuid.ID) error
	UnlockClosing(ctx context.Context, id uuid.ID) error
	GetOpenPeriods(ctx context.Context) ([]*entities.MonthlyClosing, error)
}

type monthlyClosingService struct {
	repo repositories.MonthlyClosingRepository
}

func NewMonthlyClosingService(repo repositories.MonthlyClosingRepository) MonthlyClosingService {
	return &monthlyClosingService{
		repo: repo,
	}
}

func (s *monthlyClosingService) CreateMonthlyClosing(ctx context.Context, closing *entities.MonthlyClosing) error {
	if closing.Status == "" {
		closing.Status = "open"
	}

	// Calculate net income
	closing.NetIncome = closing.TotalIncome - closing.TotalExpense

	return s.repo.Create(ctx, closing)
}

func (s *monthlyClosingService) GetMonthlyClosingByID(ctx context.Context, id uuid.ID) (*entities.MonthlyClosing, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *monthlyClosingService) GetAllMonthlyClosings(ctx context.Context) ([]*entities.MonthlyClosing, error) {
	return s.repo.GetAll(ctx)
}

func (s *monthlyClosingService) UpdateMonthlyClosing(ctx context.Context, closing *entities.MonthlyClosing) error {
	// Recalculate net income
	closing.NetIncome = closing.TotalIncome - closing.TotalExpense

	return s.repo.Update(ctx, closing)
}

func (s *monthlyClosingService) DeleteMonthlyClosing(ctx context.Context, id uuid.ID) error {
	return s.repo.Delete(ctx, id)
}

func (s *monthlyClosingService) GetMonthlyClosingByPeriod(ctx context.Context, month, year int) (*entities.MonthlyClosing, error) {
	return s.repo.GetByMonth(ctx, month, year)
}

func (s *monthlyClosingService) CloseMonth(ctx context.Context, id uuid.ID, closedBy uuid.ID) error {
	closing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	closing.Status = "closed"
	closing.ClosedBy = closedBy
	closing.ClosingDate = time.Now()

	return s.repo.Update(ctx, closing)
}

func (s *monthlyClosingService) LockClosing(ctx context.Context, id uuid.ID) error {
	closing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	closing.Status = "locked"
	closing.IsLocked = true

	return s.repo.Update(ctx, closing)
}

func (s *monthlyClosingService) UnlockClosing(ctx context.Context, id uuid.ID) error {
	closing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	closing.Status = "closed"
	closing.IsLocked = false

	return s.repo.Update(ctx, closing)
}

func (s *monthlyClosingService) GetOpenPeriods(ctx context.Context) ([]*entities.MonthlyClosing, error) {
	return s.repo.GetByStatus(ctx, "open")
}
