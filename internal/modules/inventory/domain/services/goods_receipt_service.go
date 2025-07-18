package services

import (
	"context"
	"errors"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/utils"
)

// GoodsReceiptService provides business logic for goods receipt operations.
type GoodsReceiptService struct {
	repo repositories.GoodsReceiptRepository
}

// NewGoodsReceiptService creates a new GoodsReceiptService.
func NewGoodsReceiptService(repo repositories.GoodsReceiptRepository) *GoodsReceiptService {
	return &GoodsReceiptService{repo: repo}
}

// CreateGoodsReceipt creates a new goods receipt.
func (s *GoodsReceiptService) CreateGoodsReceipt(ctx context.Context, gr *entities.GoodsReceipt) error {
	if gr.ID == "" {
		gr.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, gr)
}

// GetGoodsReceiptByID retrieves a goods receipt by its ID.
func (s *GoodsReceiptService) GetGoodsReceiptByID(ctx context.Context, id string) (*entities.GoodsReceipt, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllGoodsReceipts retrieves all goods receipts.
func (s *GoodsReceiptService) GetAllGoodsReceipts(ctx context.Context) ([]*entities.GoodsReceipt, error) {
	return s.repo.GetAll(ctx)
}

// UpdateGoodsReceipt updates an existing goods receipt.
func (s *GoodsReceiptService) UpdateGoodsReceipt(ctx context.Context, gr *entities.GoodsReceipt) error {
	// Ensure the goods receipt exists before updating
	existingGR, err := s.repo.GetByID(ctx, gr.ID)
	if err != nil {
		return err
	}
	if existingGR == nil {
		return errors.New("goods receipt not found")
	}
	return s.repo.Update(ctx, gr)
}

// DeleteGoodsReceipt deletes a goods receipt by its ID.
func (s *GoodsReceiptService) DeleteGoodsReceipt(ctx context.Context, id string) error {
	// Ensure the goods receipt exists before deleting
	existingGR, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingGR == nil {
		return errors.New("goods receipt not found")
	}
	return s.repo.Delete(ctx, id)
}
