package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// CashOpeningBalanceCreateRequest represents the request to create cash opening balance.
type CashOpeningBalanceCreateRequest struct {
	CashBankID     string    `json:"cash_bank_id" binding:"required"`
	OpeningDate    time.Time `json:"opening_date" binding:"required"`
	OpeningBalance float64   `json:"opening_balance" binding:"required"`
	Currency       string    `json:"currency" binding:"required"`
	Description    string    `json:"description"`
	FiscalYear     int       `json:"fiscal_year" binding:"required"`
	IsActive       bool      `json:"is_active"`
}

// CashOpeningBalanceUpdateRequest represents the request to update cash opening balance.
type CashOpeningBalanceUpdateRequest struct {
	CashBankID     string    `json:"cash_bank_id"`
	OpeningDate    time.Time `json:"opening_date"`
	OpeningBalance float64   `json:"opening_balance"`
	Currency       string    `json:"currency"`
	Description    string    `json:"description"`
	FiscalYear     int       `json:"fiscal_year"`
	IsActive       bool      `json:"is_active"`
}

// CashOpeningBalanceResponse represents the response for cash opening balance.
type CashOpeningBalanceResponse struct {
	ID             string    `json:"id"`
	CashBankID     string    `json:"cash_bank_id"`
	OpeningDate    time.Time `json:"opening_date"`
	OpeningBalance float64   `json:"opening_balance"`
	Currency       string    `json:"currency"`
	Description    string    `json:"description"`
	FiscalYear     int       `json:"fiscal_year"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      string    `json:"created_at"`
	UpdatedAt      string    `json:"updated_at"`
}

// ToCashOpeningBalanceEntity converts CashOpeningBalanceCreateRequest to entities.CashOpeningBalance.
func (req *CashOpeningBalanceCreateRequest) ToCashOpeningBalanceEntity() *entities.CashOpeningBalance {
	return &entities.CashOpeningBalance{
		BaseModel:      types.BaseModel{},
		CashBankID:     req.CashBankID,
		OpeningDate:    req.OpeningDate,
		OpeningBalance: req.OpeningBalance,
		Currency:       req.Currency,
		Description:    req.Description,
		FiscalYear:     req.FiscalYear,
		IsActive:       req.IsActive,
	}
}

// ToCashOpeningBalanceEntity converts CashOpeningBalanceUpdateRequest to entities.CashOpeningBalance.
func (req *CashOpeningBalanceUpdateRequest) ToCashOpeningBalanceEntity() *entities.CashOpeningBalance {
	return &entities.CashOpeningBalance{
		BaseModel:      types.BaseModel{},
		CashBankID:     req.CashBankID,
		OpeningDate:    req.OpeningDate,
		OpeningBalance: req.OpeningBalance,
		Currency:       req.Currency,
		Description:    req.Description,
		FiscalYear:     req.FiscalYear,
		IsActive:       req.IsActive,
	}
}

// FromCashOpeningBalanceEntity converts entities.CashOpeningBalance to CashOpeningBalanceResponse.
func FromCashOpeningBalanceEntity(balance *entities.CashOpeningBalance) *CashOpeningBalanceResponse {
	return &CashOpeningBalanceResponse{
		ID:             balance.ID,
		CashBankID:     balance.CashBankID,
		OpeningDate:    balance.OpeningDate,
		OpeningBalance: balance.OpeningBalance,
		Currency:       balance.Currency,
		Description:    balance.Description,
		FiscalYear:     balance.FiscalYear,
		IsActive:       balance.IsActive,
		CreatedAt:      balance.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:      balance.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}