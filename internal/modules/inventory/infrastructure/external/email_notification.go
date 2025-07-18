package external

import (
	"context"
	"fmt"
)

// EmailNotificationService defines the interface for email notification operations.
type EmailNotificationService interface {
	SendEmail(ctx context.Context, to, subject, body string) error
}

// MockEmailNotificationService is a mock implementation of EmailNotificationService.
type MockEmailNotificationService struct{}

// SendEmail mocks sending an email.
func (m *MockEmailNotificationService) SendEmail(ctx context.Context, to, subject, body string) error {
	fmt.Printf("Sending email to %s with subject %s and body %s\n", to, subject, body)
	return nil
}

