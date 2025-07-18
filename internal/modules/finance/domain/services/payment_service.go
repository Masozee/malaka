package services

import (
	"context"
	"errors"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/utils"
)

// PaymentService provides business logic for payment operations.
type PaymentService struct {
	repo repositories.PaymentRepository
}

// NewPaymentService creates a new PaymentService.
func NewPaymentService(repo repositories.PaymentRepository) *PaymentService {
	return &PaymentService{repo: repo}
}

// CreatePayment creates a new payment.
func (s *PaymentService) CreatePayment(ctx context.Context, payment *entities.Payment) error {
	if payment.ID == "" {
		payment.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, payment)
}

// GetPaymentByID retrieves a payment by its ID.
func (s *PaymentService) GetPaymentByID(ctx context.Context, id string) (*entities.Payment, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdatePayment updates an existing payment.
func (s *PaymentService) UpdatePayment(ctx context.Context, payment *entities.Payment) error {
	// Ensure the payment exists before updating
	existingPayment, err := s.repo.GetByID(ctx, payment.ID)
	if err != nil {
		return err
	}
	if existingPayment == nil {
		return errors.New("payment not found")
	}
	return s.repo.Update(ctx, payment)
}

// DeletePayment deletes a payment by its ID.
func (s *PaymentService) DeletePayment(ctx context.Context, id string) error {
	// Ensure the payment exists before deleting
	existingPayment, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingPayment == nil {
		return errors.New("payment not found")
	}
	return s.repo.Delete(ctx, id)
}
