package services

import (
	"context"
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
)

type PurchaseVoucherService interface {
	CreatePurchaseVoucher(ctx context.Context, voucher *entities.PurchaseVoucher) error
	GetPurchaseVoucherByID(ctx context.Context, id string) (*entities.PurchaseVoucher, error)
	GetAllPurchaseVouchers(ctx context.Context) ([]*entities.PurchaseVoucher, error)
	UpdatePurchaseVoucher(ctx context.Context, voucher *entities.PurchaseVoucher) error
	DeletePurchaseVoucher(ctx context.Context, id string) error
	GetPurchaseVouchersByStatus(ctx context.Context, status string) ([]*entities.PurchaseVoucher, error)
	ApprovePurchaseVoucher(ctx context.Context, id string, approvedBy string) error
}

type purchaseVoucherService struct {
	repo repositories.PurchaseVoucherRepository
}

func NewPurchaseVoucherService(repo repositories.PurchaseVoucherRepository) PurchaseVoucherService {
	return &purchaseVoucherService{
		repo: repo,
	}
}

func (s *purchaseVoucherService) CreatePurchaseVoucher(ctx context.Context, voucher *entities.PurchaseVoucher) error {
	if voucher.Status == "" {
		voucher.Status = "pending"
	}
	return s.repo.Create(ctx, voucher)
}

func (s *purchaseVoucherService) GetPurchaseVoucherByID(ctx context.Context, id string) (*entities.PurchaseVoucher, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *purchaseVoucherService) GetAllPurchaseVouchers(ctx context.Context) ([]*entities.PurchaseVoucher, error) {
	return s.repo.GetAll(ctx)
}

func (s *purchaseVoucherService) UpdatePurchaseVoucher(ctx context.Context, voucher *entities.PurchaseVoucher) error {
	return s.repo.Update(ctx, voucher)
}

func (s *purchaseVoucherService) DeletePurchaseVoucher(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *purchaseVoucherService) GetPurchaseVouchersByStatus(ctx context.Context, status string) ([]*entities.PurchaseVoucher, error) {
	return s.repo.GetByStatus(ctx, status)
}

func (s *purchaseVoucherService) ApprovePurchaseVoucher(ctx context.Context, id string, approvedBy string) error {
	voucher, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	voucher.Status = "approved"
	voucher.ApprovedBy = approvedBy
	voucher.ApprovedAt = time.Now()

	return s.repo.Update(ctx, voucher)
}