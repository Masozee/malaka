package external

import (
	"context"
)

// BarcodeGeneratorService defines the interface for barcode generation operations.
type BarcodeGeneratorService interface {
	GenerateBarcode(ctx context.Context, data string) (string, error)
}

// MockBarcodeGeneratorService is a mock implementation of BarcodeGeneratorService.
type MockBarcodeGeneratorService struct{}

// GenerateBarcode mocks barcode generation.
func (m *MockBarcodeGeneratorService) GenerateBarcode(ctx context.Context, data string) (string, error) {
	return "dummy_barcode_image_data_for_" + data, nil
}
