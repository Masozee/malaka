package services

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
)

type SalesRekonsiliasiService interface {
	CreateSalesRekonsiliasi(ctx context.Context, sr *entities.SalesRekonsiliasi) error
	GetSalesRekonsiliasiByID(ctx context.Context, id string) (*entities.SalesRekonsiliasi, error)
	GetAllSalesRekonsiliasi(ctx context.Context) ([]*entities.SalesRekonsiliasi, error)
	UpdateSalesRekonsiliasi(ctx context.Context, sr *entities.SalesRekonsiliasi) error
	DeleteSalesRekonsiliasi(ctx context.Context, id string) error
}

// SalesRekonsiliasiService provides business logic for sales reconciliation operations.
type salesRekonsiliasiService struct {
	repo repositories.SalesRekonsiliasiRepository
}

// NewSalesRekonsiliasiService creates a new SalesRekonsiliasiService.
func NewSalesRekonsiliasiService(repo repositories.SalesRekonsiliasiRepository) SalesRekonsiliasiService {
	return &salesRekonsiliasiService{repo: repo}
}

// CreateSalesRekonsiliasi creates a new sales reconciliation entry.
func (s *salesRekonsiliasiService) CreateSalesRekonsiliasi(ctx context.Context, sr *entities.SalesRekonsiliasi) error {
	if sr.ID == "" {
		sr.ID = uuid.New().String()
	}
	return s.repo.Create(ctx, sr)
}

// GetSalesRekonsiliasiByID retrieves a sales reconciliation entry by its ID.
func (s *salesRekonsiliasiService) GetSalesRekonsiliasiByID(ctx context.Context, id string) (*entities.SalesRekonsiliasi, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllSalesRekonsiliasi retrieves all sales reconciliation entries.
func (s *salesRekonsiliasiService) GetAllSalesRekonsiliasi(ctx context.Context) ([]*entities.SalesRekonsiliasi, error) {
	return s.repo.GetAll(ctx)
}

// UpdateSalesRekonsiliasi updates an existing sales reconciliation entry.
func (s *salesRekonsiliasiService) UpdateSalesRekonsiliasi(ctx context.Context, sr *entities.SalesRekonsiliasi) error {
	// Ensure the sales reconciliation entry exists before updating
	existingSR, err := s.repo.GetByID(ctx, sr.ID)
	if err != nil {
		return err
	}
	if existingSR == nil {
		return errors.New("sales reconciliation entry not found")
	}
	return s.repo.Update(ctx, sr)
}

// DeleteSalesRekonsiliasi deletes a sales reconciliation entry by its ID.
func (s *salesRekonsiliasiService) DeleteSalesRekonsiliasi(ctx context.Context, id string) error {
	// Ensure the sales reconciliation entry exists before deleting
	existingSR, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingSR == nil {
		return errors.New("sales reconciliation entry not found")
	}
	return s.repo.Delete(ctx, id)
}
