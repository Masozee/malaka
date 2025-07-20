package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// AccountsReceivableCreateRequest represents the request to create accounts receivable.
type AccountsReceivableCreateRequest struct {
	InvoiceID  string    `json:"invoice_id" binding:"required"`
	CustomerID string    `json:"customer_id" binding:"required"`
	IssueDate  time.Time `json:"issue_date" binding:"required"`
	DueDate    time.Time `json:"due_date" binding:"required"`
	Amount     float64   `json:"amount" binding:"required"`
	PaidAmount float64   `json:"paid_amount"`
	Balance    float64   `json:"balance"`
	Status     string    `json:"status" binding:"required"`
}

// AccountsReceivableUpdateRequest represents the request to update accounts receivable.
type AccountsReceivableUpdateRequest struct {
	InvoiceID  string    `json:"invoice_id"`
	CustomerID string    `json:"customer_id"`
	IssueDate  time.Time `json:"issue_date"`
	DueDate    time.Time `json:"due_date"`
	Amount     float64   `json:"amount"`
	PaidAmount float64   `json:"paid_amount"`
	Balance    float64   `json:"balance"`
	Status     string    `json:"status"`
}

// AccountsReceivableResponse represents the response for accounts receivable.
type AccountsReceivableResponse struct {
	ID         string    `json:"id"`
	InvoiceID  string    `json:"invoice_id"`
	CustomerID string    `json:"customer_id"`
	IssueDate  time.Time `json:"issue_date"`
	DueDate    time.Time `json:"due_date"`
	Amount     float64   `json:"amount"`
	PaidAmount float64   `json:"paid_amount"`
	Balance    float64   `json:"balance"`
	Status     string    `json:"status"`
	CreatedAt  string    `json:"created_at"`
	UpdatedAt  string    `json:"updated_at"`
}

// ToAccountsReceivableEntity converts AccountsReceivableCreateRequest to entities.AccountsReceivable.
func (req *AccountsReceivableCreateRequest) ToAccountsReceivableEntity() *entities.AccountsReceivable {
	return &entities.AccountsReceivable{
		BaseModel:  types.BaseModel{},
		InvoiceID:  req.InvoiceID,
		CustomerID: req.CustomerID,
		IssueDate:  req.IssueDate,
		DueDate:    req.DueDate,
		Amount:     req.Amount,
		PaidAmount: req.PaidAmount,
		Balance:    req.Balance,
		Status:     req.Status,
	}
}

// ToAccountsReceivableEntity converts AccountsReceivableUpdateRequest to entities.AccountsReceivable.
func (req *AccountsReceivableUpdateRequest) ToAccountsReceivableEntity() *entities.AccountsReceivable {
	return &entities.AccountsReceivable{
		BaseModel:  types.BaseModel{},
		InvoiceID:  req.InvoiceID,
		CustomerID: req.CustomerID,
		IssueDate:  req.IssueDate,
		DueDate:    req.DueDate,
		Amount:     req.Amount,
		PaidAmount: req.PaidAmount,
		Balance:    req.Balance,
		Status:     req.Status,
	}
}

// FromAccountsReceivableEntity converts entities.AccountsReceivable to AccountsReceivableResponse.
func FromAccountsReceivableEntity(ar *entities.AccountsReceivable) *AccountsReceivableResponse {
	return &AccountsReceivableResponse{
		ID:         ar.ID,
		InvoiceID:  ar.InvoiceID,
		CustomerID: ar.CustomerID,
		IssueDate:  ar.IssueDate,
		DueDate:    ar.DueDate,
		Amount:     ar.Amount,
		PaidAmount: ar.PaidAmount,
		Balance:    ar.Balance,
		Status:     ar.Status,
		CreatedAt:  ar.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:  ar.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}