package services

import (
	"context"
	"time"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/uuid"
)

// StockAdjustmentService provides business logic for stock adjustment operations.
type StockAdjustmentService interface {
	CreateStockAdjustment(ctx context.Context, adjustment *entities.StockAdjustment) error
	GetAllStockAdjustments(ctx context.Context) ([]*entities.StockAdjustment, error)
	GetStockAdjustmentByID(ctx context.Context, id string) (*entities.StockAdjustment, error)
	UpdateStockAdjustment(ctx context.Context, adjustment *entities.StockAdjustment) error
	DeleteStockAdjustment(ctx context.Context, id string) error
}

type stockAdjustmentServiceImpl struct {
	repo repositories.StockAdjustmentRepository
}

// NewStockAdjustmentService creates a new StockAdjustmentService.
func NewStockAdjustmentService(repo repositories.StockAdjustmentRepository) StockAdjustmentService {
	return &stockAdjustmentServiceImpl{
		repo: repo,
	}
}

// CreateStockAdjustment creates a new stock adjustment.
func (s *stockAdjustmentServiceImpl) CreateStockAdjustment(ctx context.Context, adjustment *entities.StockAdjustment) error {
	if adjustment.ID.IsNil() {
		adjustment.ID = uuid.New()
	}
	now := time.Now()
	adjustment.CreatedAt = now
	adjustment.UpdatedAt = now

	return s.repo.Create(ctx, adjustment)
}

// GetAllStockAdjustments retrieves all stock adjustments.
func (s *stockAdjustmentServiceImpl) GetAllStockAdjustments(ctx context.Context) ([]*entities.StockAdjustment, error) {
	return s.repo.GetAll(ctx)
}

// GetStockAdjustmentByID retrieves a stock adjustment by ID.
func (s *stockAdjustmentServiceImpl) GetStockAdjustmentByID(ctx context.Context, id string) (*entities.StockAdjustment, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateStockAdjustment updates an existing stock adjustment.
func (s *stockAdjustmentServiceImpl) UpdateStockAdjustment(ctx context.Context, adjustment *entities.StockAdjustment) error {
	adjustment.UpdatedAt = time.Now()
	return s.repo.Update(ctx, adjustment)
}

// DeleteStockAdjustment deletes a stock adjustment by ID.
func (s *stockAdjustmentServiceImpl) DeleteStockAdjustment(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}