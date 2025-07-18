package external

import (
	"context"
	"fmt"
)

// CourierAPIService defines the interface for courier API integration.
type CourierAPIService interface {
	TrackShipment(ctx context.Context, trackingNumber string) (string, error)
	CalculateShippingCost(ctx context.Context, origin, destination string, weight float64) (float64, error)
}

// MockCourierAPIService is a mock implementation of CourierAPIService.
type MockCourierAPIService struct{}

// TrackShipment mocks tracking a shipment.
func (m *MockCourierAPIService) TrackShipment(ctx context.Context, trackingNumber string) (string, error) {
	return fmt.Sprintf("Shipment %s is in transit", trackingNumber), nil
}

// CalculateShippingCost mocks calculating shipping cost.
func (m *MockCourierAPIService) CalculateShippingCost(ctx context.Context, origin, destination string, weight float64) (float64, error) {
	return 10000.0, nil // Dummy cost
}
