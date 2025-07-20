package services

import (
	"context"
	"errors"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/utils"
)

// StockService provides business logic for stock operations.
type StockService struct {
	stockMovementRepo repositories.StockMovementRepository
	stockBalanceRepo  repositories.StockBalanceRepository
}

// NewStockService creates a new StockService.
func NewStockService(smRepo repositories.StockMovementRepository, sbRepo repositories.StockBalanceRepository) *StockService {
	return &StockService{
		stockMovementRepo: smRepo,
		stockBalanceRepo:  sbRepo,
	}
}

// RecordStockMovement records a new stock movement and updates stock balance.
func (s *StockService) RecordStockMovement(ctx context.Context, sm *entities.StockMovement) error {
	if sm.ID == "" {
		sm.ID = utils.RandomString(10) // Generate a random ID if not provided
	}

	// Record the stock movement
	if err := s.stockMovementRepo.Create(ctx, sm); err != nil {
		return err
	}

	// Update stock balance
	balance, err := s.stockBalanceRepo.GetByArticleAndWarehouse(ctx, sm.ArticleID, sm.WarehouseID)
	if err != nil {
		return err
	}

	if balance == nil {
		// Create new balance if it doesn't exist
		balance = &entities.StockBalance{
			ArticleID:   sm.ArticleID,
			WarehouseID: sm.WarehouseID,
			Quantity:    0,
		}
		if balance.ID == "" {
			balance.ID = utils.RandomString(10)
		}
		if err := s.stockBalanceRepo.Create(ctx, balance); err != nil {
			return err
		}
	}

	// Update quantity based on movement type
	if sm.MovementType == "in" {
		balance.Quantity += sm.Quantity
	} else if sm.MovementType == "out" {
		balance.Quantity -= sm.Quantity
	} else {
		return errors.New("invalid movement type")
	}

	return s.stockBalanceRepo.Update(ctx, balance)
}

// GetStockBalance retrieves the stock balance for a given article and warehouse.
func (s *StockService) GetStockBalance(ctx context.Context, articleID, warehouseID string) (*entities.StockBalance, error) {
	return s.stockBalanceRepo.GetByArticleAndWarehouse(ctx, articleID, warehouseID)
}

// GetStockMovements retrieves all stock movements.
func (s *StockService) GetStockMovements(ctx context.Context) ([]*entities.StockMovement, error) {
	return s.stockMovementRepo.GetAll(ctx)
}
