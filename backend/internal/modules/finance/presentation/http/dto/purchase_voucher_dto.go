package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
)

type CreatePurchaseVoucherRequest struct {
	VoucherNumber   string    `json:"voucher_number" binding:"required"`
	VoucherDate     time.Time `json:"voucher_date" binding:"required"`
	SupplierID      string    `json:"supplier_id" binding:"required"`
	TotalAmount     float64   `json:"total_amount" binding:"required,min=0"`
	PaidAmount      float64   `json:"paid_amount" binding:"min=0"`
	RemainingAmount float64   `json:"remaining_amount" binding:"min=0"`
	DiscountAmount  float64   `json:"discount_amount" binding:"min=0"`
	TaxAmount       float64   `json:"tax_amount" binding:"min=0"`
	DueDate         time.Time `json:"due_date" binding:"required"`
	Description     string    `json:"description"`
}

type UpdatePurchaseVoucherRequest struct {
	VoucherNumber   string    `json:"voucher_number" binding:"required"`
	VoucherDate     time.Time `json:"voucher_date" binding:"required"`
	SupplierID      string    `json:"supplier_id" binding:"required"`
	TotalAmount     float64   `json:"total_amount" binding:"required,min=0"`
	PaidAmount      float64   `json:"paid_amount" binding:"min=0"`
	RemainingAmount float64   `json:"remaining_amount" binding:"min=0"`
	DiscountAmount  float64   `json:"discount_amount" binding:"min=0"`
	TaxAmount       float64   `json:"tax_amount" binding:"min=0"`
	DueDate         time.Time `json:"due_date" binding:"required"`
	Status          string    `json:"status" binding:"required,oneof=PENDING APPROVED PAID CANCELLED"`
	Description     string    `json:"description"`
}

type ApprovePurchaseVoucherRequest struct {
	ApprovedBy string `json:"approved_by" binding:"required"`
}

type PurchaseVoucherResponse struct {
	ID              string    `json:"id"`
	VoucherNumber   string    `json:"voucher_number"`
	VoucherDate     time.Time `json:"voucher_date"`
	SupplierID      string    `json:"supplier_id"`
	TotalAmount     float64   `json:"total_amount"`
	PaidAmount      float64   `json:"paid_amount"`
	RemainingAmount float64   `json:"remaining_amount"`
	DiscountAmount  float64   `json:"discount_amount"`
	TaxAmount       float64   `json:"tax_amount"`
	DueDate         time.Time `json:"due_date"`
	Status          string    `json:"status"`
	Description     string    `json:"description"`
	ApprovedBy      string    `json:"approved_by"`
	ApprovedAt      time.Time `json:"approved_at"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func ToPurchaseVoucherResponse(voucher *entities.PurchaseVoucher) *PurchaseVoucherResponse {
	return &PurchaseVoucherResponse{
		ID:              voucher.ID.String(),
		VoucherNumber:   voucher.VoucherNumber,
		VoucherDate:     voucher.VoucherDate,
		SupplierID:      voucher.SupplierID.String(),
		TotalAmount:     voucher.TotalAmount,
		PaidAmount:      voucher.PaidAmount,
		RemainingAmount: voucher.RemainingAmount,
		DiscountAmount:  voucher.DiscountAmount,
		TaxAmount:       voucher.TaxAmount,
		DueDate:         voucher.DueDate,
		Status:          voucher.Status,
		Description:     voucher.Description,
		ApprovedBy:      voucher.ApprovedBy.String(),
		ApprovedAt:      voucher.ApprovedAt,
		CreatedAt:       voucher.CreatedAt,
		UpdatedAt:       voucher.UpdatedAt,
	}
}

func ToPurchaseVoucherEntity(req *CreatePurchaseVoucherRequest) *entities.PurchaseVoucher {
	return &entities.PurchaseVoucher{
		VoucherNumber:   req.VoucherNumber,
		VoucherDate:     req.VoucherDate,
		SupplierID:      safeParseUUID(req.SupplierID),
		TotalAmount:     req.TotalAmount,
		PaidAmount:      req.PaidAmount,
		RemainingAmount: req.RemainingAmount,
		DiscountAmount:  req.DiscountAmount,
		TaxAmount:       req.TaxAmount,
		DueDate:         req.DueDate,
		Description:     req.Description,
	}
}
