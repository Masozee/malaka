package services

import (
	"context"
	"errors"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
	"malaka/internal/shared/utils"
)

// OnlineOrderService provides business logic for online order operations.
type OnlineOrderService struct {
	repo repositories.OnlineOrderRepository
}

// NewOnlineOrderService creates a new OnlineOrderService.
func NewOnlineOrderService(repo repositories.OnlineOrderRepository) *OnlineOrderService {
	return &OnlineOrderService{repo: repo}
}

// CreateOnlineOrder creates a new online order.
func (s *OnlineOrderService) CreateOnlineOrder(ctx context.Context, order *entities.OnlineOrder) error {
	if order.ID == "" {
		order.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, order)
}

// GetOnlineOrderByID retrieves an online order by its ID.
func (s *OnlineOrderService) GetOnlineOrderByID(ctx context.Context, id string) (*entities.OnlineOrder, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateOnlineOrder updates an existing online order.
func (s *OnlineOrderService) UpdateOnlineOrder(ctx context.Context, order *entities.OnlineOrder) error {
	// Ensure the online order exists before updating
	existingOrder, err := s.repo.GetByID(ctx, order.ID)
	if err != nil {
		return err
	}
	if existingOrder == nil {
		return errors.New("online order not found")
	}
	return s.repo.Update(ctx, order)
}

// DeleteOnlineOrder deletes an online order by its ID.
func (s *OnlineOrderService) DeleteOnlineOrder(ctx context.Context, id string) error {
	// Ensure the online order exists before deleting
	existingOrder, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingOrder == nil {
		return errors.New("online order not found")
	}
	return s.repo.Delete(ctx, id)
}
