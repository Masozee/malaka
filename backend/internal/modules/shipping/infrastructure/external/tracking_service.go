package external

import (
	"context"
	"fmt"
)

// ExternalTrackingService defines the interface for external tracking service integration.
type ExternalTrackingService interface {
	GetTrackingStatus(ctx context.Context, trackingNumber string) (string, error)
}

// MockExternalTrackingService is a mock implementation of ExternalTrackingService.
type MockExternalTrackingService struct{}

// GetTrackingStatus mocks getting tracking status from an external service.
func (m *MockExternalTrackingService) GetTrackingStatus(ctx context.Context, trackingNumber string) (string, error) {
	return fmt.Sprintf("Status for %s: Delivered", trackingNumber), nil
}
