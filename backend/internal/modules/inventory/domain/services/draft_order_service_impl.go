package services

import (
	"context"
	"errors"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/uuid"
)

// draftOrderServiceImpl implements DraftOrderService.
type draftOrderServiceImpl struct {
	repo repositories.DraftOrderRepository
}

// NewDraftOrderService creates a new DraftOrderService.
func NewDraftOrderService(repo repositories.DraftOrderRepository) DraftOrderService {
	return &draftOrderServiceImpl{repo: repo}
}

// CreateDraftOrder creates a new draft order.
func (s *draftOrderServiceImpl) CreateDraftOrder(ctx context.Context, draftOrder *entities.DraftOrder) error {
	if draftOrder.ID.IsNil() {
		draftOrder.ID = uuid.New()
	}
	return s.repo.Create(ctx, draftOrder)
}

// GetDraftOrderByID retrieves a draft order by its ID.
func (s *draftOrderServiceImpl) GetDraftOrderByID(ctx context.Context, id string) (*entities.DraftOrder, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateDraftOrder updates an existing draft order.
func (s *draftOrderServiceImpl) UpdateDraftOrder(ctx context.Context, draftOrder *entities.DraftOrder) error {
	// Ensure the draft order exists before updating
	existingDraftOrder, err := s.repo.GetByID(ctx, draftOrder.ID.String())
	if err != nil {
		return err
	}
	if existingDraftOrder == nil {
		return errors.New("draft order not found")
	}
	return s.repo.Update(ctx, draftOrder)
}

// DeleteDraftOrder deletes a draft order by its ID.
func (s *draftOrderServiceImpl) DeleteDraftOrder(ctx context.Context, id string) error {
	// Ensure the draft order exists before deleting
	existingDraftOrder, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingDraftOrder == nil {
		return errors.New("draft order not found")
	}
	return s.repo.Delete(ctx, id)
}

// GetAllDraftOrders retrieves all draft orders.
func (s *draftOrderServiceImpl) GetAllDraftOrders(ctx context.Context) ([]*entities.DraftOrder, error) {
	return s.repo.GetAll(ctx)
}
