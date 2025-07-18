package external

import (
	"context"
	"fmt"
)

// BarcodePrinterService defines the interface for barcode printing operations.
type BarcodePrinterService interface {
	PrintBarcode(ctx context.Context, barcodeData string) error
}

// MockBarcodePrinterService is a mock implementation of BarcodePrinterService.
type MockBarcodePrinterService struct{}

// PrintBarcode mocks barcode printing.
func (m *MockBarcodePrinterService) PrintBarcode(ctx context.Context, barcodeData string) error {
	fmt.Printf("Printing barcode: %s\n", barcodeData)
	return nil
}

