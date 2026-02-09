package dto

import (
	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// CashBankCreateRequest represents the request to create a cash/bank account.
type CashBankCreateRequest struct {
	Name      string  `json:"name" binding:"required"`
	AccountNo string  `json:"account_no" binding:"required"`
	Balance   float64 `json:"balance"`
	Currency  string  `json:"currency" binding:"required"`
}

// CashBankUpdateRequest represents the request to update a cash/bank account.
type CashBankUpdateRequest struct {
	Name      string  `json:"name"`
	AccountNo string  `json:"account_no"`
	Balance   float64 `json:"balance"`
	Currency  string  `json:"currency"`
}

// CashBankResponse represents the response for a cash/bank account.
type CashBankResponse struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	AccountNo string  `json:"account_no"`
	Balance   float64 `json:"balance"`
	Currency  string  `json:"currency"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

// ToCashBankEntity converts CashBankCreateRequest to entities.CashBank.
func (req *CashBankCreateRequest) ToCashBankEntity() *entities.CashBank {
	return &entities.CashBank{
		BaseModel: types.BaseModel{},
		Name:      req.Name,
		AccountNo: req.AccountNo,
		Balance:   req.Balance,
		Currency:  req.Currency,
	}
}

// ToCashBankEntity converts CashBankUpdateRequest to entities.CashBank.
func (req *CashBankUpdateRequest) ToCashBankEntity() *entities.CashBank {
	return &entities.CashBank{
		BaseModel: types.BaseModel{},
		Name:      req.Name,
		AccountNo: req.AccountNo,
		Balance:   req.Balance,
		Currency:  req.Currency,
	}
}

// FromCashBankEntity converts entities.CashBank to CashBankResponse.
func FromCashBankEntity(cb *entities.CashBank) *CashBankResponse {
	return &CashBankResponse{
		ID:        cb.ID.String(),
		Name:      cb.Name,
		AccountNo: cb.AccountNo,
		Balance:   cb.Balance,
		Currency:  cb.Currency,
		CreatedAt: cb.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt: cb.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
