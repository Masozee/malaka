package external

import (
	"context"
	"fmt"
)

// BankAPIService defines the interface for bank API integration.
type BankAPIService interface {
	GetAccountBalance(ctx context.Context, accountNo string) (float64, error)
	TransferFunds(ctx context.Context, fromAccount, toAccount string, amount float64) error
}

// MockBankAPIService is a mock implementation of BankAPIService.
type MockBankAPIService struct{}

// GetAccountBalance mocks getting account balance.
func (m *MockBankAPIService) GetAccountBalance(ctx context.Context, accountNo string) (float64, error) {
	return 1000000.0, nil // Dummy balance
}

// TransferFunds mocks transferring funds.
func (m *MockBankAPIService) TransferFunds(ctx context.Context, fromAccount, toAccount string, amount float64) error {
	fmt.Printf("Transferring %.2f from %s to %s\n", amount, fromAccount, toAccount)
	return nil
}
