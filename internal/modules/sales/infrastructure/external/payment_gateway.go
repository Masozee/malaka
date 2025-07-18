package external

import (
	"context"
	"fmt"
)

// PaymentGatewayService defines the interface for payment processing.
type PaymentGatewayService interface {
	ProcessPayment(ctx context.Context, amount float64, currency, cardNumber, expiry, cvv string) (string, error)
}

// MockPaymentGatewayService is a mock implementation of PaymentGatewayService.
type MockPaymentGatewayService struct{}

// ProcessPayment mocks payment processing.
func (m *MockPaymentGatewayService) ProcessPayment(ctx context.Context, amount float64, currency, cardNumber, expiry, cvv string) (string, error) {
	fmt.Printf("Processing payment of %.2f %s\n", amount, currency)
	return "payment_success_id_123", nil
}
