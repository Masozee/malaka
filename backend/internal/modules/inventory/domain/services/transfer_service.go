package services

import (
	"context"
	"errors"
	"time"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/uuid"
)

// TransferService provides business logic for stock transfers.
type TransferService struct {
	transferOrderRepo repositories.TransferOrderRepository
	transferItemRepo  repositories.TransferItemRepository
	stockService      *StockService
}

// NewTransferService creates a new TransferService.
func NewTransferService(toRepo repositories.TransferOrderRepository, tiRepo repositories.TransferItemRepository, stockService *StockService) *TransferService {
	return &TransferService{
		transferOrderRepo: toRepo,
		transferItemRepo:  tiRepo,
		stockService:      stockService,
	}
}

// CreateTransferOrder creates a new transfer order and records stock movements.
func (s *TransferService) CreateTransferOrder(ctx context.Context, to *entities.TransferOrder, items []*entities.TransferItem) error {
	if to.ID.IsNil() {
		to.ID = uuid.New()
	}

	// Create the transfer order
	if err := s.transferOrderRepo.Create(ctx, to); err != nil {
		return err
	}

	now := time.Now()
	for _, item := range items {
		item.TransferOrderID = to.ID.String()
		if item.ID.IsNil() {
			item.ID = uuid.New()
		}
		// Create transfer item
		if err := s.transferItemRepo.Create(ctx, item); err != nil {
			return err
		}

		// Parse article ID to uuid.ID
		articleID, _ := uuid.Parse(item.ArticleID)

		// Record stock movement out of source warehouse
		outMovement := &entities.StockMovement{
			ArticleID:    articleID,
			WarehouseID:  to.FromWarehouseID,
			Quantity:     item.Quantity,
			MovementType: "out",
			MovementDate: now,
			ReferenceID:  to.ID,
		}
		if err := s.stockService.RecordStockMovement(ctx, outMovement); err != nil {
			return err
		}

		// Record stock movement into destination warehouse
		inMovement := &entities.StockMovement{
			ArticleID:    articleID,
			WarehouseID:  to.ToWarehouseID,
			Quantity:     item.Quantity,
			MovementType: "in",
			MovementDate: now,
			ReferenceID:  to.ID,
		}
		if err := s.stockService.RecordStockMovement(ctx, inMovement); err != nil {
			return err
		}
	}

	return nil
}

// GetTransferOrderByID retrieves a transfer order by its ID.
func (s *TransferService) GetTransferOrderByID(ctx context.Context, id string) (*entities.TransferOrder, error) {
	return s.transferOrderRepo.GetByID(ctx, id)
}

// GetAllTransferOrders retrieves all transfer orders.
func (s *TransferService) GetAllTransferOrders(ctx context.Context) ([]*entities.TransferOrder, error) {
	return s.transferOrderRepo.GetAll(ctx)
}

// UpdateTransferOrder updates an existing transfer order.
func (s *TransferService) UpdateTransferOrder(ctx context.Context, to *entities.TransferOrder) error {
	// Ensure the transfer order exists before updating
	existingTO, err := s.transferOrderRepo.GetByID(ctx, to.ID.String())
	if err != nil {
		return err
	}
	if existingTO == nil {
		return errors.New("transfer order not found")
	}
	return s.transferOrderRepo.Update(ctx, to)
}

// DeleteTransferOrder deletes a transfer order by its ID.
func (s *TransferService) DeleteTransferOrder(ctx context.Context, id string) error {
	// Ensure the transfer order exists before deleting
	existingTO, err := s.transferOrderRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingTO == nil {
		return errors.New("transfer order not found")
	}
	return s.transferOrderRepo.Delete(ctx, id)
}
