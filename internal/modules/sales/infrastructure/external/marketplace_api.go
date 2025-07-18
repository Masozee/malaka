package external

import (
	"context"
	"fmt"
)

// MarketplaceAPIService defines the interface for marketplace integration.
type MarketplaceAPIService interface {
	SyncOrder(ctx context.Context, orderID string) error
}

// MockMarketplaceAPIService is a mock implementation of MarketplaceAPIService.
type MockMarketplaceAPIService struct{}

// SyncOrder mocks syncing an order with a marketplace.
func (m *MockMarketplaceAPIService) SyncOrder(ctx context.Context, orderID string) error {
	fmt.Printf("Syncing order %s with marketplace\n", orderID)
	return nil
}

