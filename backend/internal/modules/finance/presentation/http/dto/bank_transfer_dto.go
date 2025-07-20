package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// BankTransferCreateRequest represents the request to create bank transfer.
type BankTransferCreateRequest struct {
	TransferDate   time.Time `json:"transfer_date" binding:"required"`
	FromCashBankID string    `json:"from_cash_bank_id" binding:"required"`
	ToCashBankID   string    `json:"to_cash_bank_id" binding:"required"`
	Amount         float64   `json:"amount" binding:"required"`
	Description    string    `json:"description" binding:"required"`
}

// BankTransferUpdateRequest represents the request to update bank transfer.
type BankTransferUpdateRequest struct {
	TransferDate   time.Time `json:"transfer_date"`
	FromCashBankID string    `json:"from_cash_bank_id"`
	ToCashBankID   string    `json:"to_cash_bank_id"`
	Amount         float64   `json:"amount"`
	Description    string    `json:"description"`
}

// BankTransferResponse represents the response for bank transfer.
type BankTransferResponse struct {
	ID             string    `json:"id"`
	TransferDate   time.Time `json:"transfer_date"`
	FromCashBankID string    `json:"from_cash_bank_id"`
	ToCashBankID   string    `json:"to_cash_bank_id"`
	Amount         float64   `json:"amount"`
	Description    string    `json:"description"`
	CreatedAt      string    `json:"created_at"`
	UpdatedAt      string    `json:"updated_at"`
}

// ToBankTransferEntity converts BankTransferCreateRequest to entities.BankTransfer.
func (req *BankTransferCreateRequest) ToBankTransferEntity() *entities.BankTransfer {
	return &entities.BankTransfer{
		BaseModel:      types.BaseModel{},
		TransferDate:   req.TransferDate,
		FromCashBankID: req.FromCashBankID,
		ToCashBankID:   req.ToCashBankID,
		Amount:         req.Amount,
		Description:    req.Description,
	}
}

// ToBankTransferEntity converts BankTransferUpdateRequest to entities.BankTransfer.
func (req *BankTransferUpdateRequest) ToBankTransferEntity() *entities.BankTransfer {
	return &entities.BankTransfer{
		BaseModel:      types.BaseModel{},
		TransferDate:   req.TransferDate,
		FromCashBankID: req.FromCashBankID,
		ToCashBankID:   req.ToCashBankID,
		Amount:         req.Amount,
		Description:    req.Description,
	}
}

// FromBankTransferEntity converts entities.BankTransfer to BankTransferResponse.
func FromBankTransferEntity(bt *entities.BankTransfer) *BankTransferResponse {
	return &BankTransferResponse{
		ID:             bt.ID,
		TransferDate:   bt.TransferDate,
		FromCashBankID: bt.FromCashBankID,
		ToCashBankID:   bt.ToCashBankID,
		Amount:         bt.Amount,
		Description:    bt.Description,
		CreatedAt:      bt.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:      bt.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}