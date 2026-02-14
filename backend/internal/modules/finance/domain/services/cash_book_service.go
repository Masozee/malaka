package services

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

type CashBookService interface {
	CreateCashBook(ctx context.Context, entry *entities.CashBook) error
	GetCashBookByID(ctx context.Context, id uuid.ID) (*entities.CashBook, error)
	GetAllCashBooks(ctx context.Context) ([]*entities.CashBook, error)
	UpdateCashBook(ctx context.Context, entry *entities.CashBook) error
	DeleteCashBook(ctx context.Context, id uuid.ID) error
	GetCashBooksByType(ctx context.Context, bookType string) ([]*entities.CashBook, error)
}

type cashBookService struct {
	repo repositories.CashBookRepository
}

func NewCashBookService(repo repositories.CashBookRepository) CashBookService {
	return &cashBookService{
		repo: repo,
	}
}

func (s *cashBookService) CreateCashBook(ctx context.Context, entry *entities.CashBook) error {
	if !entry.IsActive {
		entry.IsActive = true
	}
	return s.repo.Create(ctx, entry)
}

func (s *cashBookService) GetCashBookByID(ctx context.Context, id uuid.ID) (*entities.CashBook, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *cashBookService) GetAllCashBooks(ctx context.Context) ([]*entities.CashBook, error) {
	return s.repo.GetAll(ctx)
}

func (s *cashBookService) UpdateCashBook(ctx context.Context, entry *entities.CashBook) error {
	return s.repo.Update(ctx, entry)
}

func (s *cashBookService) DeleteCashBook(ctx context.Context, id uuid.ID) error {
	return s.repo.Delete(ctx, id)
}

func (s *cashBookService) GetCashBooksByType(ctx context.Context, bookType string) ([]*entities.CashBook, error) {
	return s.repo.GetByBookType(ctx, bookType)
}
