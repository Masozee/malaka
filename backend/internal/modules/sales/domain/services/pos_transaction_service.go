package services

import (
	"context"
	"errors"

	inventory_entities "malaka/internal/modules/inventory/domain/entities"
	inventory_services "malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
	"malaka/internal/shared/utils"
	"malaka/internal/shared/uuid"
)

// Main warehouse ID - Gudang Pusat Jakarta
var mainWarehouseID = uuid.MustParse("815eefd0-2291-44ac-9f9f-a2c932818315")

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
	if pt.ID.IsNil() {
		pt.ID = uuid.New() // Generate a UUID v7
	}

	// Create the POS transaction
	if err := s.repo.Create(ctx, pt); err != nil {
		return err
	}

	for _, item := range items {
		item.PosTransactionID = pt.ID
		if item.ID.IsNil() {
			item.ID = uuid.New()
		}
		// Create POS item
		if err := s.itemRepo.Create(ctx, item); err != nil {
			return err
		}

		// Record stock movement out of warehouse (using main warehouse)
		outMovement := &inventory_entities.StockMovement{
			ArticleID:    item.ArticleID,
			WarehouseID:  mainWarehouseID,
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

// GetAllPosTransactions retrieves all POS transactions.
func (s *PosTransactionService) GetAllPosTransactions(ctx context.Context) ([]*entities.PosTransaction, error) {
	return s.repo.GetAll(ctx)
}

// PosTransactionDetail holds a transaction with its line items.
type PosTransactionDetail struct {
	*entities.PosTransaction
	Items []*entities.PosItem `json:"items"`
}

// GetPosTransactionByID retrieves a POS transaction by its ID.
func (s *PosTransactionService) GetPosTransactionByID(ctx context.Context, id uuid.ID) (*entities.PosTransaction, error) {
	return s.repo.GetByID(ctx, id)
}

// GetPosTransactionByIDWithItems retrieves a POS transaction with its line items.
func (s *PosTransactionService) GetPosTransactionByIDWithItems(ctx context.Context, id uuid.ID) (*PosTransactionDetail, error) {
	pt, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if pt == nil {
		return nil, nil
	}
	items, err := s.itemRepo.GetByPosTransactionID(ctx, id)
	if err != nil {
		return nil, err
	}
	return &PosTransactionDetail{PosTransaction: pt, Items: items}, nil
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
func (s *PosTransactionService) DeletePosTransaction(ctx context.Context, id uuid.ID) error {
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
