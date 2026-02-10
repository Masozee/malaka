package services

import (
	"context"
	"errors"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/uuid"
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
	if sm.ID.IsNil() {
		sm.ID = uuid.New() // Generate a UUID v7
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
		if balance.ID.IsNil() {
			balance.ID = uuid.New()
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
func (s *StockService) GetStockBalance(ctx context.Context, articleID, warehouseID uuid.ID) (*entities.StockBalance, error) {
	return s.stockBalanceRepo.GetByArticleAndWarehouse(ctx, articleID, warehouseID)
}

// GetStockMovements retrieves all stock movements.
func (s *StockService) GetStockMovements(ctx context.Context) ([]*entities.StockMovement, error) {
	return s.stockMovementRepo.GetAll(ctx)
}

// GetAllStockBalances retrieves all stock balances from the database.
func (s *StockService) GetAllStockBalances(ctx context.Context) ([]*entities.StockBalance, error) {
	return s.stockBalanceRepo.GetAll(ctx)
}

// GetStockControlData retrieves all stock balances with article and warehouse details for stock control page.
func (s *StockService) GetStockControlData(ctx context.Context) ([]*repositories.StockControlItem, error) {
	return s.stockBalanceRepo.GetAllWithDetails(ctx)
}

// GetStockControlDataByID retrieves a single stock balance with article and warehouse details.
func (s *StockService) GetStockControlDataByID(ctx context.Context, id uuid.ID) (*repositories.StockControlItem, error) {
	return s.stockBalanceRepo.GetByIDWithDetails(ctx, id)
}
