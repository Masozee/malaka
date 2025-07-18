package services

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/utils"
)

// StockOpnameService provides business logic for stock opname operations.
type StockOpnameService interface {
	CreateStockOpname(ctx context.Context, opname *entities.StockOpname) error
	GetAllStockOpnames(ctx context.Context) ([]*entities.StockOpname, error)
	GetStockOpnameByID(ctx context.Context, id string) (*entities.StockOpname, error)
	UpdateStockOpname(ctx context.Context, opname *entities.StockOpname) error
	DeleteStockOpname(ctx context.Context, id string) error
}

type stockOpnameServiceImpl struct {
	repo repositories.StockOpnameRepository
}

// NewStockOpnameService creates a new StockOpnameService.
func NewStockOpnameService(repo repositories.StockOpnameRepository) StockOpnameService {
	return &stockOpnameServiceImpl{
		repo: repo,
	}
}

// CreateStockOpname creates a new stock opname.
func (s *stockOpnameServiceImpl) CreateStockOpname(ctx context.Context, opname *entities.StockOpname) error {
	if opname.ID == "" {
		opname.ID = utils.RandomString(10)
	}
	opname.CreatedAt = utils.Now()
	opname.UpdatedAt = utils.Now()

	return s.repo.Create(ctx, opname)
}

// GetAllStockOpnames retrieves all stock opnames.
func (s *stockOpnameServiceImpl) GetAllStockOpnames(ctx context.Context) ([]*entities.StockOpname, error) {
	return s.repo.GetAll(ctx)
}

// GetStockOpnameByID retrieves a stock opname by ID.
func (s *stockOpnameServiceImpl) GetStockOpnameByID(ctx context.Context, id string) (*entities.StockOpname, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateStockOpname updates an existing stock opname.
func (s *stockOpnameServiceImpl) UpdateStockOpname(ctx context.Context, opname *entities.StockOpname) error {
	opname.UpdatedAt = utils.Now()
	return s.repo.Update(ctx, opname)
}

// DeleteStockOpname deletes a stock opname by ID.
func (s *stockOpnameServiceImpl) DeleteStockOpname(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}