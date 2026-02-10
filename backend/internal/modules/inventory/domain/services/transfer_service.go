package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/uuid"
)

// ReceivedTransferItem represents a single item received during the receive step.
type ReceivedTransferItem struct {
	ItemID           string `json:"item_id"`
	ReceivedQuantity int    `json:"received_quantity"`
}

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

// CreateTransferOrder creates a new transfer order as draft (no stock movement).
func (s *TransferService) CreateTransferOrder(ctx context.Context, to *entities.TransferOrder, items []*entities.TransferItem) error {
	if to.ID.IsNil() {
		to.ID = uuid.New()
	}

	if err := s.transferOrderRepo.Create(ctx, to); err != nil {
		return err
	}

	for _, item := range items {
		item.TransferOrderID = to.ID.String()
		if item.ID.IsNil() {
			item.ID = uuid.New()
		}
		if item.CreatedAt.IsZero() {
			now := time.Now()
			item.CreatedAt = now
			item.UpdatedAt = now
		}
		if err := s.transferItemRepo.Create(ctx, item); err != nil {
			return err
		}
	}

	return nil
}

// ApproveTransferOrder transitions draft/pending → approved.
func (s *TransferService) ApproveTransferOrder(ctx context.Context, id string, approvedBy string) (*entities.TransferOrder, error) {
	to, err := s.transferOrderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if to == nil {
		return nil, errors.New("transfer order not found")
	}
	if to.Status != entities.TransferStatusDraft && to.Status != entities.TransferStatusPending {
		return nil, fmt.Errorf("cannot approve transfer with status %s", to.Status)
	}

	now := time.Now()
	to.Status = entities.TransferStatusApproved
	to.ApprovedBy = &approvedBy
	to.ApprovedDate = &now
	to.UpdatedAt = now

	if err := s.transferOrderRepo.Update(ctx, to); err != nil {
		return nil, err
	}
	return to, nil
}

// ShipTransferOrder transitions approved → in_transit and records stock OUT from source warehouse.
func (s *TransferService) ShipTransferOrder(ctx context.Context, id string, shippedBy string) (*entities.TransferOrder, error) {
	to, err := s.transferOrderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if to == nil {
		return nil, errors.New("transfer order not found")
	}
	if to.Status != entities.TransferStatusApproved {
		return nil, fmt.Errorf("cannot ship transfer with status %s", to.Status)
	}

	items, err := s.transferItemRepo.GetByTransferOrderID(ctx, id)
	if err != nil {
		return nil, err
	}

	now := time.Now()

	// Record stock OUT from source warehouse
	for _, item := range items {
		articleID, _ := uuid.Parse(item.ArticleID)
		outMovement := &entities.StockMovement{
			ArticleID:    articleID,
			WarehouseID:  to.FromWarehouseID,
			Quantity:     item.Quantity,
			MovementType: "out",
			MovementDate: now,
			ReferenceID:  to.ID,
		}
		if err := s.stockService.RecordStockMovement(ctx, outMovement); err != nil {
			return nil, fmt.Errorf("failed to record stock out for item %s: %w", item.ID, err)
		}
	}

	to.Status = entities.TransferStatusInTransit
	to.ShippedBy = &shippedBy
	to.ShippedDate = &now
	to.UpdatedAt = now

	if err := s.transferOrderRepo.Update(ctx, to); err != nil {
		return nil, err
	}
	return to, nil
}

// ReceiveTransferOrder transitions in_transit → completed with item-by-item checking.
func (s *TransferService) ReceiveTransferOrder(ctx context.Context, id string, receivedBy string, receivedItems []ReceivedTransferItem) (*entities.TransferOrder, error) {
	to, err := s.transferOrderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if to == nil {
		return nil, errors.New("transfer order not found")
	}
	if to.Status != entities.TransferStatusInTransit {
		return nil, fmt.Errorf("cannot receive transfer with status %s", to.Status)
	}

	receivedMap := make(map[string]int)
	for _, ri := range receivedItems {
		receivedMap[ri.ItemID] = ri.ReceivedQuantity
	}

	items, err := s.transferItemRepo.GetByTransferOrderID(ctx, id)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	hasAnyDiscrepancy := false

	for _, item := range items {
		receivedQty, ok := receivedMap[item.ID.String()]
		if !ok {
			receivedQty = 0
		}
		item.ReceivedQuantity = receivedQty
		item.HasDiscrepancy = receivedQty < item.Quantity
		if item.HasDiscrepancy {
			hasAnyDiscrepancy = true
		}
		item.UpdatedAt = now
		if err := s.transferItemRepo.Update(ctx, item); err != nil {
			return nil, fmt.Errorf("failed to update received qty for item %s: %w", item.ID, err)
		}

		// Record stock IN at destination for actual received quantity
		if receivedQty > 0 {
			articleID, _ := uuid.Parse(item.ArticleID)
			inMovement := &entities.StockMovement{
				ArticleID:    articleID,
				WarehouseID:  to.ToWarehouseID,
				Quantity:     receivedQty,
				MovementType: "in",
				MovementDate: now,
				ReferenceID:  to.ID,
			}
			if err := s.stockService.RecordStockMovement(ctx, inMovement); err != nil {
				return nil, fmt.Errorf("failed to record stock in for item %s: %w", item.ID, err)
			}
		}
	}

	to.Status = entities.TransferStatusCompleted
	to.ReceivedBy = &receivedBy
	to.ReceivedDate = &now
	to.UpdatedAt = now
	if hasAnyDiscrepancy {
		to.Notes = to.Notes + " [Discrepancy detected during receiving]"
	}

	if err := s.transferOrderRepo.Update(ctx, to); err != nil {
		return nil, err
	}
	return to, nil
}

// CancelTransferOrder cancels a transfer order. Reverses stock if in_transit.
func (s *TransferService) CancelTransferOrder(ctx context.Context, id string, cancelledBy string, reason string) (*entities.TransferOrder, error) {
	to, err := s.transferOrderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if to == nil {
		return nil, errors.New("transfer order not found")
	}
	if to.Status == entities.TransferStatusCompleted || to.Status == entities.TransferStatusCancelled {
		return nil, fmt.Errorf("cannot cancel transfer with status %s", to.Status)
	}

	// If cancelling while in_transit, reverse the stock OUT movements
	if to.Status == entities.TransferStatusInTransit {
		items, err := s.transferItemRepo.GetByTransferOrderID(ctx, id)
		if err != nil {
			return nil, err
		}
		now := time.Now()
		for _, item := range items {
			articleID, _ := uuid.Parse(item.ArticleID)
			reverseMovement := &entities.StockMovement{
				ArticleID:    articleID,
				WarehouseID:  to.FromWarehouseID,
				Quantity:     item.Quantity,
				MovementType: "in",
				MovementDate: now,
				ReferenceID:  to.ID,
			}
			if err := s.stockService.RecordStockMovement(ctx, reverseMovement); err != nil {
				return nil, fmt.Errorf("failed to reverse stock movement for item %s: %w", item.ID, err)
			}
		}
	}

	now := time.Now()
	to.Status = entities.TransferStatusCancelled
	to.CancelledBy = &cancelledBy
	to.CancelledDate = &now
	to.CancelReason = reason
	to.UpdatedAt = now

	if err := s.transferOrderRepo.Update(ctx, to); err != nil {
		return nil, err
	}
	return to, nil
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
	existingTO, err := s.transferOrderRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingTO == nil {
		return errors.New("transfer order not found")
	}
	return s.transferOrderRepo.Delete(ctx, id)
}
