package external

import (
	"context"
	"fmt"
)

// PosPrinterService defines the interface for POS receipt printing.
type PosPrinterService interface {
	PrintReceipt(ctx context.Context, receiptData string) error
}

// MockPosPrinterService is a mock implementation of PosPrinterService.
type MockPosPrinterService struct{}

// PrintReceipt mocks printing a receipt.
func (m *MockPosPrinterService) PrintReceipt(ctx context.Context, receiptData string) error {
	fmt.Printf("Printing receipt: %s\n", receiptData)
	return nil
}

