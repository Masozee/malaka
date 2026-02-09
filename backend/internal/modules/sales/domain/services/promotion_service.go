package services

import (
	"context"
	"errors"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
	"malaka/internal/shared/uuid"
)

// PromotionService provides business logic for promotion operations.
type PromotionService struct {
	repo repositories.PromotionRepository
}

// NewPromotionService creates a new PromotionService.
func NewPromotionService(repo repositories.PromotionRepository) *PromotionService {
	return &PromotionService{repo: repo}
}

// CreatePromotion creates a new promotion.
func (s *PromotionService) CreatePromotion(ctx context.Context, promo *entities.Promotion) error {
	if promo.ID.IsNil() {
		promo.ID = uuid.New()
	}
	return s.repo.Create(ctx, promo)
}

// GetAllPromotions retrieves all promotions.
func (s *PromotionService) GetAllPromotions(ctx context.Context) ([]*entities.Promotion, error) {
	return s.repo.GetAll(ctx)
}

// GetPromotionByID retrieves a promotion by its ID.
func (s *PromotionService) GetPromotionByID(ctx context.Context, id string) (*entities.Promotion, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdatePromotion updates an existing promotion.
func (s *PromotionService) UpdatePromotion(ctx context.Context, promo *entities.Promotion) error {
	// Ensure the promotion exists before updating
	existingPromo, err := s.repo.GetByID(ctx, promo.ID.String())
	if err != nil {
		return err
	}
	if existingPromo == nil {
		return errors.New("promotion not found")
	}
	return s.repo.Update(ctx, promo)
}

// DeletePromotion deletes a promotion by its ID.
func (s *PromotionService) DeletePromotion(ctx context.Context, id string) error {
	// Ensure the promotion exists before deleting
	existingPromo, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingPromo == nil {
		return errors.New("promotion not found")
	}
	return s.repo.Delete(ctx, id)
}
