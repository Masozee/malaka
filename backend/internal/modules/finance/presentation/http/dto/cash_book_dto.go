package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

type CreateCashBookEntryRequest struct {
	CashBankID      string    `json:"cash_bank_id" binding:"required"`
	TransactionDate time.Time `json:"transaction_date" binding:"required"`
	ReferenceNumber string    `json:"reference_number" binding:"required"`
	Description     string    `json:"description" binding:"required"`
	DebitAmount     float64   `json:"debit_amount" binding:"min=0"`
	CreditAmount    float64   `json:"credit_amount" binding:"min=0"`
	TransactionType string    `json:"transaction_type" binding:"required,oneof=receipt disbursement transfer adjustment"`
	SourceModule    string    `json:"source_module"`
	SourceID        string    `json:"source_id"`
	CreatedBy       string    `json:"created_by" binding:"required"`
}

type UpdateCashBookEntryRequest struct {
	CashBankID      string    `json:"cash_bank_id" binding:"required"`
	TransactionDate time.Time `json:"transaction_date" binding:"required"`
	ReferenceNumber string    `json:"reference_number" binding:"required"`
	Description     string    `json:"description" binding:"required"`
	DebitAmount     float64   `json:"debit_amount" binding:"min=0"`
	CreditAmount    float64   `json:"credit_amount" binding:"min=0"`
	TransactionType string    `json:"transaction_type" binding:"required,oneof=receipt disbursement transfer adjustment"`
	SourceModule    string    `json:"source_module"`
	SourceID        string    `json:"source_id"`
	CreatedBy       string    `json:"created_by" binding:"required"`
}

type CashBookEntryResponse struct {
	ID              string    `json:"id"`
	CashBankID      string    `json:"cash_bank_id"`
	TransactionDate time.Time `json:"transaction_date"`
	ReferenceNumber string    `json:"reference_number"`
	Description     string    `json:"description"`
	DebitAmount     float64   `json:"debit_amount"`
	CreditAmount    float64   `json:"credit_amount"`
	Balance         float64   `json:"balance"`
	TransactionType string    `json:"transaction_type"`
	SourceModule    string    `json:"source_module"`
	SourceID        string    `json:"source_id"`
	CreatedBy       string    `json:"created_by"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type CashBalanceResponse struct {
	CashBankID string  `json:"cash_bank_id"`
	Balance    float64 `json:"balance"`
	AsOfDate   string  `json:"as_of_date"`
}

func ToCashBookEntryResponse(entry *entities.CashBook) *CashBookEntryResponse {
	return &CashBookEntryResponse{
		ID:              entry.ID.String(),
		CashBankID:      entry.CashBankID.String(),
		TransactionDate: entry.TransactionDate,
		ReferenceNumber: entry.ReferenceNumber,
		Description:     entry.Description,
		DebitAmount:     entry.DebitAmount,
		CreditAmount:    entry.CreditAmount,
		Balance:         entry.Balance,
		TransactionType: entry.TransactionType,
		SourceModule:    entry.SourceModule,
		SourceID:        entry.SourceID.String(),
		CreatedBy:       entry.CreatedBy.String(),
		CreatedAt:       entry.CreatedAt,
		UpdatedAt:       entry.UpdatedAt,
	}
}

func ToCashBookEntity(req *CreateCashBookEntryRequest) *entities.CashBook {
	return &entities.CashBook{
		CashBankID:      uuid.MustParse(req.CashBankID),
		TransactionDate: req.TransactionDate,
		ReferenceNumber: req.ReferenceNumber,
		Description:     req.Description,
		DebitAmount:     req.DebitAmount,
		CreditAmount:    req.CreditAmount,
		TransactionType: req.TransactionType,
		SourceModule:    req.SourceModule,
		SourceID:        uuid.MustParse(req.SourceID),
		CreatedBy:       uuid.MustParse(req.CreatedBy),
	}
}
