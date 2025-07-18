package services

import (
	"context"
	"errors"

	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/repositories"
	"malaka/internal/shared/utils"
)

// TrackingService provides business logic for tracking operations.
type TrackingService struct {
	repo repositories.TrackingRepository
}

// NewTrackingService creates a new TrackingService.
func NewTrackingService(repo repositories.TrackingRepository) *TrackingService {
	return &TrackingService{repo: repo}
}

// CreateTracking creates a new tracking record.
func (s *TrackingService) CreateTracking(ctx context.Context, tracking *entities.Tracking) error {
	if tracking.ID == "" {
		tracking.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, tracking)
}

// GetTrackingByID retrieves a tracking record by its ID.
func (s *TrackingService) GetTrackingByID(ctx context.Context, id string) (*entities.Tracking, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateTracking updates an existing tracking record.
func (s *TrackingService) UpdateTracking(ctx context.Context, tracking *entities.Tracking) error {
	// Ensure the tracking record exists before updating
	existingTracking, err := s.repo.GetByID(ctx, tracking.ID)
	if err != nil {
		return err
	}
	if existingTracking == nil {
		return errors.New("tracking record not found")
	}
	return s.repo.Update(ctx, tracking)
}

// DeleteTracking deletes a tracking record by its ID.
func (s *TrackingService) DeleteTracking(ctx context.Context, id string) error {
	// Ensure the tracking record exists before deleting
	existingTracking, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingTracking == nil {
		return errors.New("tracking record not found")
	}
	return s.repo.Delete(ctx, id)
}
