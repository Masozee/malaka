package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/uuid"
)

// BarcodeService provides business logic for barcode operations.
type BarcodeService struct {
	repo        repositories.BarcodeRepository
	articleRepo repositories.ArticleRepository
}

// NewBarcodeService creates a new BarcodeService.
func NewBarcodeService(repo repositories.BarcodeRepository, articleRepo repositories.ArticleRepository) *BarcodeService {
	return &BarcodeService{
		repo:        repo,
		articleRepo: articleRepo,
	}
}

// CreateBarcode creates a new barcode.
func (s *BarcodeService) CreateBarcode(ctx context.Context, barcode *entities.Barcode) error {
	if barcode.ID.IsNil() {
		barcode.ID = uuid.New()
	}
	return s.repo.Create(ctx, barcode)
}

// GetBarcodeByID retrieves a barcode by its ID.
func (s *BarcodeService) GetBarcodeByID(ctx context.Context, id uuid.ID) (*entities.Barcode, error) {
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
func (s *BarcodeService) DeleteBarcode(ctx context.Context, id uuid.ID) error {
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

// GetBarcodesByArticleID retrieves all barcodes for a specific article.
func (s *BarcodeService) GetBarcodesByArticleID(ctx context.Context, articleID uuid.ID) ([]*entities.Barcode, error) {
	return s.repo.GetByArticleID(ctx, articleID)
}

// GetAllArticlesForBarcodeGeneration retrieves all articles for barcode generation.
func (s *BarcodeService) GetAllArticlesForBarcodeGeneration(ctx context.Context) ([]*entities.Article, error) {
	return s.articleRepo.GetAll(ctx)
}

// UpdateArticleBarcodeURL updates the barcode URL for an article.
func (s *BarcodeService) UpdateArticleBarcodeURL(ctx context.Context, articleID uuid.ID, barcodeURL string) error {
	article, err := s.articleRepo.GetByID(ctx, articleID)
	if err != nil {
		return err
	}
	if article == nil {
		return errors.New("article not found")
	}

	// Update the article with the barcode URL
	article.BarcodeURL = barcodeURL
	return s.articleRepo.Update(ctx, article)
}
