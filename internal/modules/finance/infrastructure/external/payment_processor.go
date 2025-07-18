package external

import (
	"context"
	"fmt"
)

// PaymentProcessorService defines the interface for payment processing.
type PaymentProcessorService interface {
	ProcessPayment(ctx context.Context, amount float64, currency, token string) (string, error)
}

// MockPaymentProcessorService is a mock implementation of PaymentProcessorService.
type MockPaymentProcessorService struct{}

// ProcessPayment mocks payment processing.
func (m *MockPaymentProcessorService) ProcessPayment(ctx context.Context, amount float64, currency, token string) (string, error) {
	fmt.Printf("Processing payment of %.2f %s with token %s\n", amount, currency, token)
	return "payment_id_abc", nil
}

