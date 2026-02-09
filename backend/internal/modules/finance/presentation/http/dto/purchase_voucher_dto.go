package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

type CreatePurchaseVoucherRequest struct {
	VoucherNumber string    `json:"voucher_number" binding:"required"`
	VoucherDate   time.Time `json:"voucher_date" binding:"required"`
	SupplierID    string    `json:"supplier_id" binding:"required"`
	InvoiceID     string    `json:"invoice_id" binding:"required"`
	TotalAmount   float64   `json:"total_amount" binding:"required,min=0"`
	TaxAmount     float64   `json:"tax_amount" binding:"min=0"`
	GrandTotal    float64   `json:"grand_total" binding:"required,min=0"`
	DueDate       time.Time `json:"due_date" binding:"required"`
	Description   string    `json:"description"`
}

type UpdatePurchaseVoucherRequest struct {
	VoucherNumber string    `json:"voucher_number" binding:"required"`
	VoucherDate   time.Time `json:"voucher_date" binding:"required"`
	SupplierID    string    `json:"supplier_id" binding:"required"`
	InvoiceID     string    `json:"invoice_id" binding:"required"`
	TotalAmount   float64   `json:"total_amount" binding:"required,min=0"`
	TaxAmount     float64   `json:"tax_amount" binding:"min=0"`
	GrandTotal    float64   `json:"grand_total" binding:"required,min=0"`
	DueDate       time.Time `json:"due_date" binding:"required"`
	Status        string    `json:"status" binding:"required,oneof=pending approved paid cancelled"`
	Description   string    `json:"description"`
}

type ApprovePurchaseVoucherRequest struct {
	ApprovedBy string `json:"approved_by" binding:"required"`
}

type PurchaseVoucherResponse struct {
	ID            string    `json:"id"`
	VoucherNumber string    `json:"voucher_number"`
	VoucherDate   time.Time `json:"voucher_date"`
	SupplierID    string    `json:"supplier_id"`
	InvoiceID     string    `json:"invoice_id"`
	TotalAmount   float64   `json:"total_amount"`
	TaxAmount     float64   `json:"tax_amount"`
	GrandTotal    float64   `json:"grand_total"`
	DueDate       time.Time `json:"due_date"`
	Status        string    `json:"status"`
	Description   string    `json:"description"`
	ApprovedBy    string    `json:"approved_by"`
	ApprovedAt    time.Time `json:"approved_at"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func ToPurchaseVoucherResponse(voucher *entities.PurchaseVoucher) *PurchaseVoucherResponse {
	return &PurchaseVoucherResponse{
		ID:            voucher.ID.String(),
		VoucherNumber: voucher.VoucherNumber,
		VoucherDate:   voucher.VoucherDate,
		SupplierID:    voucher.SupplierID.String(),
		InvoiceID:     voucher.InvoiceID.String(),
		TotalAmount:   voucher.TotalAmount,
		TaxAmount:     voucher.TaxAmount,
		GrandTotal:    voucher.GrandTotal,
		DueDate:       voucher.DueDate,
		Status:        voucher.Status,
		Description:   voucher.Description,
		ApprovedBy:    voucher.ApprovedBy.String(),
		ApprovedAt:    voucher.ApprovedAt,
		CreatedAt:     voucher.CreatedAt,
		UpdatedAt:     voucher.UpdatedAt,
	}
}

func ToPurchaseVoucherEntity(req *CreatePurchaseVoucherRequest) *entities.PurchaseVoucher {
	return &entities.PurchaseVoucher{
		VoucherNumber: req.VoucherNumber,
		VoucherDate:   req.VoucherDate,
		SupplierID:    uuid.MustParse(req.SupplierID),
		InvoiceID:     uuid.MustParse(req.InvoiceID),
		TotalAmount:   req.TotalAmount,
		TaxAmount:     req.TaxAmount,
		GrandTotal:    req.GrandTotal,
		DueDate:       req.DueDate,
		Description:   req.Description,
	}
}
