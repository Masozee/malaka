package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// AccountsPayableCreateRequest represents the request to create accounts payable.
type AccountsPayableCreateRequest struct {
	InvoiceID  string    `json:"invoice_id" binding:"required"`
	SupplierID string    `json:"supplier_id" binding:"required"`
	IssueDate  time.Time `json:"issue_date" binding:"required"`
	DueDate    time.Time `json:"due_date" binding:"required"`
	Amount     float64   `json:"amount" binding:"required"`
	PaidAmount float64   `json:"paid_amount"`
	Balance    float64   `json:"balance"`
	Status     string    `json:"status" binding:"required"`
}

// AccountsPayableUpdateRequest represents the request to update accounts payable.
type AccountsPayableUpdateRequest struct {
	InvoiceID  string    `json:"invoice_id"`
	SupplierID string    `json:"supplier_id"`
	IssueDate  time.Time `json:"issue_date"`
	DueDate    time.Time `json:"due_date"`
	Amount     float64   `json:"amount"`
	PaidAmount float64   `json:"paid_amount"`
	Balance    float64   `json:"balance"`
	Status     string    `json:"status"`
}

// AccountsPayableResponse represents the response for accounts payable.
type AccountsPayableResponse struct {
	ID         string    `json:"id"`
	InvoiceID  string    `json:"invoice_id"`
	SupplierID string    `json:"supplier_id"`
	IssueDate  time.Time `json:"issue_date"`
	DueDate    time.Time `json:"due_date"`
	Amount     float64   `json:"amount"`
	PaidAmount float64   `json:"paid_amount"`
	Balance    float64   `json:"balance"`
	Status     string    `json:"status"`
	CreatedAt  string    `json:"created_at"`
	UpdatedAt  string    `json:"updated_at"`
}

// ToAccountsPayableEntity converts AccountsPayableCreateRequest to entities.AccountsPayable.
func (req *AccountsPayableCreateRequest) ToAccountsPayableEntity() *entities.AccountsPayable {
	return &entities.AccountsPayable{
		BaseModel:  types.BaseModel{},
		InvoiceID:  safeParseUUID(req.InvoiceID),
		SupplierID: safeParseUUID(req.SupplierID),
		IssueDate:  req.IssueDate,
		DueDate:    req.DueDate,
		Amount:     req.Amount,
		PaidAmount: req.PaidAmount,
		Balance:    req.Balance,
		Status:     req.Status,
	}
}

// ToAccountsPayableEntity converts AccountsPayableUpdateRequest to entities.AccountsPayable.
func (req *AccountsPayableUpdateRequest) ToAccountsPayableEntity() *entities.AccountsPayable {
	return &entities.AccountsPayable{
		BaseModel:  types.BaseModel{},
		InvoiceID:  safeParseUUID(req.InvoiceID),
		SupplierID: safeParseUUID(req.SupplierID),
		IssueDate:  req.IssueDate,
		DueDate:    req.DueDate,
		Amount:     req.Amount,
		PaidAmount: req.PaidAmount,
		Balance:    req.Balance,
		Status:     req.Status,
	}
}

// FromAccountsPayableEntity converts entities.AccountsPayable to AccountsPayableResponse.
func FromAccountsPayableEntity(ap *entities.AccountsPayable) *AccountsPayableResponse {
	return &AccountsPayableResponse{
		ID:         ap.ID.String(),
		InvoiceID:  ap.InvoiceID.String(),
		SupplierID: ap.SupplierID.String(),
		IssueDate:  ap.IssueDate,
		DueDate:    ap.DueDate,
		Amount:     ap.Amount,
		PaidAmount: ap.PaidAmount,
		Balance:    ap.Balance,
		Status:     ap.Status,
		CreatedAt:  ap.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:  ap.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
