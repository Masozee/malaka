package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/utils"
)

// PriceService provides business logic for price operations.
type PriceService struct {
	repo repositories.PriceRepository
}

// NewPriceService creates a new PriceService.
func NewPriceService(repo repositories.PriceRepository) *PriceService {
	return &PriceService{repo: repo}
}

// CreatePrice creates a new price.
func (s *PriceService) CreatePrice(ctx context.Context, price *entities.Price) error {
	if price.ID == "" {
		price.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, price)
}

// GetPriceByID retrieves a price by its ID.
func (s *PriceService) GetPriceByID(ctx context.Context, id string) (*entities.Price, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllPrices retrieves all prices.
func (s *PriceService) GetAllPrices(ctx context.Context) ([]*entities.Price, error) {
	return s.repo.GetAll(ctx)
}

// UpdatePrice updates an existing price.
func (s *PriceService) UpdatePrice(ctx context.Context, price *entities.Price) error {
	// Ensure the price exists before updating
	existingPrice, err := s.repo.GetByID(ctx, price.ID)
	if err != nil {
		return err
	}
	if existingPrice == nil {
		return errors.New("price not found")
	}
	return s.repo.Update(ctx, price)
}

// DeletePrice deletes a price by its ID.
func (s *PriceService) DeletePrice(ctx context.Context, id string) error {
	// Ensure the price exists before deleting
	existingPrice, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingPrice == nil {
		return errors.New("price not found")
	}
	return s.repo.Delete(ctx, id)
}
