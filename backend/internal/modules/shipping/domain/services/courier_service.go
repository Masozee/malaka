package services

import (
	"context"
	"errors"

	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/repositories"
	"malaka/internal/shared/uuid"
)

// CourierService provides business logic for courier operations.
type CourierService struct {
	repo repositories.CourierRepository
}

// NewCourierService creates a new CourierService.
func NewCourierService(repo repositories.CourierRepository) *CourierService {
	return &CourierService{repo: repo}
}

// CreateCourier creates a new courier.
func (s *CourierService) CreateCourier(ctx context.Context, courier *entities.Courier) error {
	if courier.ID.IsNil() {
		courier.ID = uuid.New()
	}
	return s.repo.Create(ctx, courier)
}

// GetCourierByID retrieves a courier by its ID.
func (s *CourierService) GetCourierByID(ctx context.Context, id uuid.ID) (*entities.Courier, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllCouriers retrieves all couriers.
func (s *CourierService) GetAllCouriers(ctx context.Context) ([]*entities.Courier, error) {
	return s.repo.GetAll(ctx)
}

// UpdateCourier updates an existing courier.
func (s *CourierService) UpdateCourier(ctx context.Context, courier *entities.Courier) error {
	// Ensure the courier exists before updating
	existingCourier, err := s.repo.GetByID(ctx, courier.ID)
	if err != nil {
		return err
	}
	if existingCourier == nil {
		return errors.New("courier not found")
	}
	return s.repo.Update(ctx, courier)
}

// DeleteCourier deletes a courier by its ID.
func (s *CourierService) DeleteCourier(ctx context.Context, id uuid.ID) error {
	// Ensure the courier exists before deleting
	existingCourier, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingCourier == nil {
		return errors.New("courier not found")
	}
	return s.repo.Delete(ctx, id)
}
