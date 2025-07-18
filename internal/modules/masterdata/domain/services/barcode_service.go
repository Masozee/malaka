package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/utils"
)

// BarcodeService provides business logic for barcode operations.
type BarcodeService struct {
	repo repositories.BarcodeRepository
}

// NewBarcodeService creates a new BarcodeService.
func NewBarcodeService(repo repositories.BarcodeRepository) *BarcodeService {
	return &BarcodeService{repo: repo}
}

// CreateBarcode creates a new barcode.
func (s *BarcodeService) CreateBarcode(ctx context.Context, barcode *entities.Barcode) error {
	if barcode.ID == "" {
		barcode.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, barcode)
}

// GetBarcodeByID retrieves a barcode by its ID.
func (s *BarcodeService) GetBarcodeByID(ctx context.Context, id string) (*entities.Barcode, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllBarcodes retrieves all barcodes.
func (s *BarcodeService) GetAllBarcodes(ctx context.Context) ([]*entities.Barcode, error) {
	return s.repo.GetAll(ctx)
}

// UpdateBarcode updates an existing barcode.
func (s *BarcodeService) UpdateBarcode(ctx context.Context, barcode *entities.Barcode) error {
	// Ensure the barcode exists before updating
	existingBarcode, err := s.repo.GetByID(ctx, barcode.ID)
	if err != nil {
		return err
	}
	if existingBarcode == nil {
		return errors.New("barcode not found")
	}
	return s.repo.Update(ctx, barcode)
}

// DeleteBarcode deletes a barcode by its ID.
func (s *BarcodeService) DeleteBarcode(ctx context.Context, id string) error {
	// Ensure the barcode exists before deleting
	existingBarcode, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingBarcode == nil {
		return errors.New("barcode not found")
	}
	return s.repo.Delete(ctx, id)
}
