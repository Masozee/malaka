package services

import (
	"context"
	"errors"

	inventory_entities "malaka/internal/modules/inventory/domain/entities"
	inventory_services "malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
	"malaka/internal/shared/utils"
)

// PosTransactionService provides business logic for POS transactions.
type PosTransactionService struct {
	repo         repositories.PosTransactionRepository
	itemRepo     repositories.PosItemRepository
	stockService *inventory_services.StockService
}

// NewPosTransactionService creates a new PosTransactionService.
func NewPosTransactionService(repo repositories.PosTransactionRepository, itemRepo repositories.PosItemRepository, stockService *inventory_services.StockService) *PosTransactionService {
	return &PosTransactionService{
		repo:         repo,
		itemRepo:     itemRepo,
		stockService: stockService,
	}
}

// CreatePosTransaction creates a new POS transaction and records stock movements.
func (s *PosTransactionService) CreatePosTransaction(ctx context.Context, pt *entities.PosTransaction, items []*entities.PosItem) error {
	if pt.ID == "" {
		pt.ID = utils.RandomString(10) // Generate a random ID if not provided
	}

	// Create the POS transaction
	if err := s.repo.Create(ctx, pt); err != nil {
		return err
	}

	for _, item := range items {
		item.PosTransactionID = pt.ID
		if item.ID == "" {
			item.ID = utils.RandomString(10)
		}
		// Create POS item
		if err := s.itemRepo.Create(ctx, item); err != nil {
			return err
		}

		// Record stock movement out of warehouse (assuming a default warehouse for now)
		outMovement := &inventory_entities.StockMovement{
			ArticleID:    item.ArticleID,
			WarehouseID:  "default_warehouse_id", // TODO: Get actual warehouse ID
			Quantity:     item.Quantity,
			MovementType: "out",
			MovementDate: utils.Now(),
			ReferenceID:  pt.ID,
		}
				if err := s.stockService.RecordStockMovement(ctx, outMovement); err != nil {
			return err
		}
	}

	return nil
}


// GetPosTransactionByID retrieves a POS transaction by its ID.
func (s *PosTransactionService) GetPosTransactionByID(ctx context.Context, id string) (*entities.PosTransaction, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdatePosTransaction updates an existing POS transaction.
func (s *PosTransactionService) UpdatePosTransaction(ctx context.Context, pt *entities.PosTransaction) error {
	// Ensure the POS transaction exists before updating
	existingPT, err := s.repo.GetByID(ctx, pt.ID)
	if err != nil {
		return err
	}
	if existingPT == nil {
		return errors.New("POS transaction not found")
	}
	return s.repo.Update(ctx, pt)
}

// DeletePosTransaction deletes a POS transaction by its ID.
func (s *PosTransactionService) DeletePosTransaction(ctx context.Context, id string) error {
	// Ensure the POS transaction exists before deleting
	existingPT, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingPT == nil {
		return errors.New("POS transaction not found")
	}
	return s.repo.Delete(ctx, id)
}
