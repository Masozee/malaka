package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
)

// PurchaseVoucherRepository defines the interface for purchase voucher data access.
type PurchaseVoucherRepository interface {
	Create(ctx context.Context, voucher *entities.PurchaseVoucher) error
	GetByID(ctx context.Context, id string) (*entities.PurchaseVoucher, error)
	GetAll(ctx context.Context) ([]*entities.PurchaseVoucher, error)
	GetBySupplierID(ctx context.Context, supplierID string) ([]*entities.PurchaseVoucher, error)
	GetByStatus(ctx context.Context, status string) ([]*entities.PurchaseVoucher, error)
	GetByVoucherNumber(ctx context.Context, voucherNumber string) (*entities.PurchaseVoucher, error)
	Update(ctx context.Context, voucher *entities.PurchaseVoucher) error
	Delete(ctx context.Context, id string) error
}