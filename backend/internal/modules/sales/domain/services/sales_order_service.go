package services

import (
	"context"
	"errors"
	"time"

	inventory_entities "malaka/internal/modules/inventory/domain/entities"
	inventory_services "malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
	"malaka/internal/shared/uuid"
)

// SalesOrderService provides business logic for sales order operations.
type SalesOrderService struct {
	repo         repositories.SalesOrderRepository
	itemRepo     repositories.SalesOrderItemRepository
	stockService *inventory_services.StockService
}

// NewSalesOrderService creates a new SalesOrderService.
func NewSalesOrderService(repo repositories.SalesOrderRepository, itemRepo repositories.SalesOrderItemRepository, stockService *inventory_services.StockService) *SalesOrderService {
	return &SalesOrderService{
		repo:         repo,
		itemRepo:     itemRepo,
		stockService: stockService,
	}
}

// CreateSalesOrder creates a new sales order and records stock movements.
func (s *SalesOrderService) CreateSalesOrder(ctx context.Context, so *entities.SalesOrder, items []*entities.SalesOrderItem) error {
	if so.ID.IsNil() {
		so.ID = uuid.New()
	}

	// Create the sales order
	if err := s.repo.Create(ctx, so); err != nil {
		return err
	}

	for _, item := range items {
		item.SalesOrderID = so.ID.String()
		if item.ID.IsNil() {
			item.ID = uuid.New()
		}
		// Create sales order item
		if err := s.itemRepo.Create(ctx, item); err != nil {
			return err
		}

		// Record stock movement out of warehouse (assuming a default warehouse for now)
		articleID, _ := uuid.Parse(item.ArticleID)
		warehouseID := uuid.New() // TODO: Get actual warehouse ID
		outMovement := &inventory_entities.StockMovement{
			ArticleID:    articleID,
			WarehouseID:  warehouseID,
			Quantity:     item.Quantity,
			MovementType: "out",
			MovementDate: time.Now(),
			ReferenceID:  so.ID,
		}
		if err := s.stockService.RecordStockMovement(ctx, outMovement); err != nil {
			return err
		}
	}

	return nil
}

func (s *SalesOrderService) GetAllSalesOrders(ctx context.Context) ([]*entities.SalesOrder, error) {
	return s.repo.GetAll(ctx)
}

// GetSalesOrderByID retrieves a sales order by its ID.
func (s *SalesOrderService) GetSalesOrderByID(ctx context.Context, id string) (*entities.SalesOrder, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateSalesOrder updates an existing sales order.
func (s *SalesOrderService) UpdateSalesOrder(ctx context.Context, so *entities.SalesOrder) error {
	// Ensure the sales order exists before updating
	existingSO, err := s.repo.GetByID(ctx, so.ID.String())
	if err != nil {
		return err
	}
	if existingSO == nil {
		return errors.New("sales order not found")
	}
	return s.repo.Update(ctx, so)
}

// DeleteSalesOrder deletes a sales order by its ID.
func (s *SalesOrderService) DeleteSalesOrder(ctx context.Context, id string) error {
	// Ensure the sales order exists before deleting
	existingSO, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingSO == nil {
		return errors.New("sales order not found")
	}
	return s.repo.Delete(ctx, id)
}
