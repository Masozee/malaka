package services

import (
	"context"
	"errors"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/utils"
)

// PurchaseOrderService provides business logic for purchase order operations.
type PurchaseOrderService struct {
	repo repositories.PurchaseOrderRepository
}

// NewPurchaseOrderService creates a new PurchaseOrderService.
func NewPurchaseOrderService(repo repositories.PurchaseOrderRepository) *PurchaseOrderService {
	return &PurchaseOrderService{repo: repo}
}

// CreatePurchaseOrder creates a new purchase order.
func (s *PurchaseOrderService) CreatePurchaseOrder(ctx context.Context, po *entities.PurchaseOrder) error {
	if po.ID == "" {
		po.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, po)
}

// GetPurchaseOrderByID retrieves a purchase order by its ID.
func (s *PurchaseOrderService) GetPurchaseOrderByID(ctx context.Context, id string) (*entities.PurchaseOrder, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllPurchaseOrders retrieves all purchase orders.
func (s *PurchaseOrderService) GetAllPurchaseOrders(ctx context.Context) ([]*entities.PurchaseOrder, error) {
	return s.repo.GetAll(ctx)
}

// UpdatePurchaseOrder updates an existing purchase order.
func (s *PurchaseOrderService) UpdatePurchaseOrder(ctx context.Context, po *entities.PurchaseOrder) error {
	// Ensure the purchase order exists before updating
	existingPO, err := s.repo.GetByID(ctx, po.ID)
	if err != nil {
		return err
	}
	if existingPO == nil {
		return errors.New("purchase order not found")
	}
	return s.repo.Update(ctx, po)
}

// DeletePurchaseOrder deletes a purchase order by its ID.
func (s *PurchaseOrderService) DeletePurchaseOrder(ctx context.Context, id string) error {
	// Ensure the purchase order exists before deleting
	existingPO, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingPO == nil {
		return errors.New("purchase order not found")
	}
	return s.repo.Delete(ctx, id)
}
