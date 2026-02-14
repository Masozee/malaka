package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// CashReceiptCreateRequest represents the request to create cash receipt.
type CashReceiptCreateRequest struct {
	ReceiptDate time.Time `json:"receipt_date" binding:"required"`
	Amount      float64   `json:"amount" binding:"required"`
	Description string    `json:"description" binding:"required"`
	CashBankID  string    `json:"cash_bank_id" binding:"required"`
}

// CashReceiptUpdateRequest represents the request to update cash receipt.
type CashReceiptUpdateRequest struct {
	ReceiptDate time.Time `json:"receipt_date"`
	Amount      float64   `json:"amount"`
	Description string    `json:"description"`
	CashBankID  string    `json:"cash_bank_id"`
}

// CashReceiptResponse represents the response for cash receipt.
type CashReceiptResponse struct {
	ID          string    `json:"id"`
	ReceiptDate time.Time `json:"receipt_date"`
	Amount      float64   `json:"amount"`
	Description string    `json:"description"`
	CashBankID  string    `json:"cash_bank_id"`
	CreatedAt   string    `json:"created_at"`
	UpdatedAt   string    `json:"updated_at"`
}

// ToCashReceiptEntity converts CashReceiptCreateRequest to entities.CashReceipt.
func (req *CashReceiptCreateRequest) ToCashReceiptEntity() *entities.CashReceipt {
	return &entities.CashReceipt{
		BaseModel:   types.BaseModel{},
		ReceiptDate: req.ReceiptDate,
		Amount:      req.Amount,
		Description: req.Description,
		CashBankID:  safeParseUUID(req.CashBankID),
	}
}

// ToCashReceiptEntity converts CashReceiptUpdateRequest to entities.CashReceipt.
func (req *CashReceiptUpdateRequest) ToCashReceiptEntity() *entities.CashReceipt {
	return &entities.CashReceipt{
		BaseModel:   types.BaseModel{},
		ReceiptDate: req.ReceiptDate,
		Amount:      req.Amount,
		Description: req.Description,
		CashBankID:  safeParseUUID(req.CashBankID),
	}
}

// FromCashReceiptEntity converts entities.CashReceipt to CashReceiptResponse.
func FromCashReceiptEntity(cr *entities.CashReceipt) *CashReceiptResponse {
	return &CashReceiptResponse{
		ID:          cr.ID.String(),
		ReceiptDate: cr.ReceiptDate,
		Amount:      cr.Amount,
		Description: cr.Description,
		CashBankID:  cr.CashBankID.String(),
		CreatedAt:   cr.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:   cr.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
