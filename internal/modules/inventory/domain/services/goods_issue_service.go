package services

import (
	"errors"
)

import (
	"context"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
)

type GoodsIssueService interface {
	CreateGoodsIssue(ctx context.Context, issueDate time.Time, warehouseID uuid.UUID, notes string, items []CreateGoodsIssueItemRequest) (*entities.GoodsIssue, error)
	GetGoodsIssueByID(ctx context.Context, id uuid.UUID) (*entities.GoodsIssue, error)
	ListGoodsIssues(ctx context.Context, limit, offset int, filter map[string]interface{}) ([]*entities.GoodsIssue, error)
	UpdateGoodsIssue(ctx context.Context, id uuid.UUID, issueDate time.Time, warehouseID uuid.UUID, status, notes string, items []UpdateGoodsIssueItemRequest) (*entities.GoodsIssue, error)
	DeleteGoodsIssue(ctx context.Context, id uuid.UUID) error
	UpdateGoodsIssueStatus(ctx context.Context, id uuid.UUID, status string) error
}

type goodsIssueService struct {
	repo repositories.GoodsIssueRepository
}

func NewGoodsIssueService(repo repositories.GoodsIssueRepository) GoodsIssueService {
	return &goodsIssueService{repo: repo}
}

type CreateGoodsIssueItemRequest struct {
	ArticleID uuid.UUID
	Quantity  int
	UnitPrice float64
	Unit      string
}

type UpdateGoodsIssueItemRequest struct {
	ID        uuid.UUID
	ArticleID uuid.UUID
	Quantity  int
	UnitPrice float64
	Unit      string
}

func (s *goodsIssueService) CreateGoodsIssue(ctx context.Context, issueDate time.Time, warehouseID uuid.UUID, notes string, items []CreateGoodsIssueItemRequest) (*entities.GoodsIssue, error) {
	gi, err := entities.NewGoodsIssue(uuid.New(), issueDate, warehouseID, "Draft", notes)
	if err != nil {
		return nil, err
	}

	for _, itemReq := range items {
		item, err := entities.NewGoodsIssueItem(uuid.New(), gi.ID, itemReq.ArticleID, itemReq.Quantity, itemReq.UnitPrice, itemReq.Unit)
		if err != nil {
			return nil, err
		}
		gi.AddItem(item)
	}

	if err := s.repo.Save(ctx, gi); err != nil {
		return nil, err
	}

	return gi, nil
}

func (s *goodsIssueService) GetGoodsIssueByID(ctx context.Context, id uuid.UUID) (*entities.GoodsIssue, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *goodsIssueService) ListGoodsIssues(ctx context.Context, limit, offset int, filter map[string]interface{}) ([]*entities.GoodsIssue, error) {
	return s.repo.FindAll(ctx, limit, offset, filter)
}

func (s *goodsIssueService) UpdateGoodsIssue(ctx context.Context, id uuid.UUID, issueDate time.Time, warehouseID uuid.UUID, status, notes string, items []UpdateGoodsIssueItemRequest) (*entities.GoodsIssue, error) {
	gi, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if gi == nil {
		return nil, errors.New("goods issue not found")
	}

	gi.IssueDate = issueDate
	gi.WarehouseID = warehouseID
	gi.Status = status
	gi.Notes = notes

	// Clear existing items and add new ones
	gi.Items = []*entities.GoodsIssueItem{}
	for _, itemReq := range items {
		item, err := entities.NewGoodsIssueItem(itemReq.ID, gi.ID, itemReq.ArticleID, itemReq.Quantity, itemReq.UnitPrice, itemReq.Unit)
		if err != nil {
			return nil, err
		}
		gi.AddItem(item)
	}

	if err := s.repo.Save(ctx, gi); err != nil {
		return nil, err
	}

	return gi, nil
}

func (s *goodsIssueService) DeleteGoodsIssue(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *goodsIssueService) UpdateGoodsIssueStatus(ctx context.Context, id uuid.UUID, status string) error {
	gi, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	if gi == nil {
		return errors.New("goods issue not found")
	}

	// Basic status validation (can be expanded)
	if status != "Draft" && status != "Completed" && status != "Canceled" {
		return errors.New("invalid status")
	}

	gi.Status = status

	return s.repo.Save(ctx, gi)
}
