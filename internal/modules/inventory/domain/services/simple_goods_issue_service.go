package services

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/utils"
)

// SimpleGoodsIssueService provides business logic for simple goods issue operations.
type SimpleGoodsIssueService interface {
	CreateGoodsIssue(ctx context.Context, goodsIssue *entities.SimpleGoodsIssue) error
	GetAllGoodsIssues(ctx context.Context) ([]*entities.SimpleGoodsIssue, error)
	GetGoodsIssueByID(ctx context.Context, id string) (*entities.SimpleGoodsIssue, error)
	UpdateGoodsIssue(ctx context.Context, goodsIssue *entities.SimpleGoodsIssue) error
	DeleteGoodsIssue(ctx context.Context, id string) error
}

type simpleGoodsIssueServiceImpl struct {
	repo repositories.SimpleGoodsIssueRepository
}

// NewSimpleGoodsIssueService creates a new SimpleGoodsIssueService.
func NewSimpleGoodsIssueService(repo repositories.SimpleGoodsIssueRepository) SimpleGoodsIssueService {
	return &simpleGoodsIssueServiceImpl{
		repo: repo,
	}
}

// CreateGoodsIssue creates a new simple goods issue.
func (s *simpleGoodsIssueServiceImpl) CreateGoodsIssue(ctx context.Context, goodsIssue *entities.SimpleGoodsIssue) error {
	if goodsIssue.ID == "" {
		goodsIssue.ID = utils.RandomString(10)
	}
	goodsIssue.CreatedAt = utils.Now()
	goodsIssue.UpdatedAt = utils.Now()

	return s.repo.Create(ctx, goodsIssue)
}

// GetAllGoodsIssues retrieves all simple goods issues.
func (s *simpleGoodsIssueServiceImpl) GetAllGoodsIssues(ctx context.Context) ([]*entities.SimpleGoodsIssue, error) {
	return s.repo.GetAll(ctx)
}

// GetGoodsIssueByID retrieves a simple goods issue by ID.
func (s *simpleGoodsIssueServiceImpl) GetGoodsIssueByID(ctx context.Context, id string) (*entities.SimpleGoodsIssue, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateGoodsIssue updates an existing simple goods issue.
func (s *simpleGoodsIssueServiceImpl) UpdateGoodsIssue(ctx context.Context, goodsIssue *entities.SimpleGoodsIssue) error {
	goodsIssue.UpdatedAt = utils.Now()
	return s.repo.Update(ctx, goodsIssue)
}

// DeleteGoodsIssue deletes a simple goods issue by ID.
func (s *simpleGoodsIssueServiceImpl) DeleteGoodsIssue(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}