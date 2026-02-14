package services

import (
	"context"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
	"malaka/internal/shared/uuid"
)

// TaxService provides business logic for tax operations.
type TaxService struct {
	repo repositories.TaxRepository
}

// NewTaxService creates a new TaxService.
func NewTaxService(repo repositories.TaxRepository) *TaxService {
	return &TaxService{repo: repo}
}

// --- Tax CRUD ---

func (s *TaxService) CreateTax(ctx context.Context, tax *entities.Tax) error {
	if err := tax.Validate(); err != nil {
		return err
	}
	return s.repo.Create(ctx, tax)
}

func (s *TaxService) GetTaxByID(ctx context.Context, id uuid.ID) (*entities.Tax, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *TaxService) GetAllTaxes(ctx context.Context) ([]*entities.Tax, error) {
	return s.repo.GetAll(ctx)
}

func (s *TaxService) GetTaxesByType(ctx context.Context, taxType entities.TaxType) ([]*entities.Tax, error) {
	return s.repo.GetByType(ctx, taxType)
}

func (s *TaxService) UpdateTax(ctx context.Context, tax *entities.Tax) error {
	return s.repo.Update(ctx, tax)
}

func (s *TaxService) DeleteTax(ctx context.Context, id uuid.ID) error {
	return s.repo.Delete(ctx, id)
}

// --- Tax Transaction ---

func (s *TaxService) CreateTransaction(ctx context.Context, tx *entities.TaxTransaction) error {
	if err := tx.Validate(); err != nil {
		return err
	}
	tx.TotalAmount = tx.BaseAmount + tx.TaxAmount
	return s.repo.CreateTransaction(ctx, tx)
}

func (s *TaxService) GetTransactionByID(ctx context.Context, id uuid.ID) (*entities.TaxTransaction, error) {
	return s.repo.GetTransactionByID(ctx, id)
}

func (s *TaxService) GetTransactionsByType(ctx context.Context, txType string) ([]*entities.TaxTransaction, error) {
	return s.repo.GetTransactionsByType(ctx, "", txType)
}

func (s *TaxService) GetTransactionsByPeriod(ctx context.Context, startDate, endDate time.Time) ([]*entities.TaxTransaction, error) {
	return s.repo.GetTransactionsByPeriod(ctx, "", startDate, endDate)
}

func (s *TaxService) UpdateTransaction(ctx context.Context, tx *entities.TaxTransaction) error {
	return s.repo.UpdateTransaction(ctx, tx)
}

func (s *TaxService) DeleteTransaction(ctx context.Context, id uuid.ID) error {
	return s.repo.DeleteTransaction(ctx, id)
}

// --- Tax Return ---

func (s *TaxService) CreateReturn(ctx context.Context, ret *entities.TaxReturn) error {
	if err := ret.Validate(); err != nil {
		return err
	}
	ret.CalculateNetTax()
	ret.CalculateTotalDue()
	return s.repo.CreateReturn(ctx, ret)
}

func (s *TaxService) GetReturnByID(ctx context.Context, id uuid.ID) (*entities.TaxReturn, error) {
	return s.repo.GetReturnByID(ctx, id)
}

func (s *TaxService) GetAllReturns(ctx context.Context) ([]*entities.TaxReturn, error) {
	return s.repo.GetReturnsByCompany(ctx, "")
}

func (s *TaxService) GetReturnsByStatus(ctx context.Context, status entities.TaxStatus) ([]*entities.TaxReturn, error) {
	return s.repo.GetReturnsByStatus(ctx, "", status)
}

func (s *TaxService) UpdateReturn(ctx context.Context, ret *entities.TaxReturn) error {
	return s.repo.UpdateReturn(ctx, ret)
}

func (s *TaxService) DeleteReturn(ctx context.Context, id uuid.ID) error {
	return s.repo.DeleteReturn(ctx, id)
}

func (s *TaxService) SubmitReturn(ctx context.Context, id uuid.ID, userID string) error {
	return s.repo.SubmitReturn(ctx, id, userID)
}

func (s *TaxService) PayReturn(ctx context.Context, id uuid.ID, amount float64) error {
	return s.repo.PayReturn(ctx, id, amount)
}

// --- Reports ---

func (s *TaxService) GetVATReport(ctx context.Context, startDate, endDate time.Time) (map[string]float64, error) {
	return s.repo.GetVATReport(ctx, "", startDate, endDate)
}

func (s *TaxService) GetTaxLiabilityReport(ctx context.Context) (map[entities.TaxType]float64, error) {
	return s.repo.GetTaxLiabilityReport(ctx, "", time.Now())
}
