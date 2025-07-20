package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
)

type CreateExpenditureRequestRequest struct {
	RequestNumber string    `json:"request_number" binding:"required"`
	RequestDate   time.Time `json:"request_date" binding:"required"`
	RequestedBy   string    `json:"requested_by" binding:"required"`
	CashBankID    string    `json:"cash_bank_id" binding:"required"`
	Amount        float64   `json:"amount" binding:"required,min=0"`
	Purpose       string    `json:"purpose" binding:"required"`
	Description   string    `json:"description"`
}

type UpdateExpenditureRequestRequest struct {
	RequestNumber string    `json:"request_number" binding:"required"`
	RequestDate   time.Time `json:"request_date" binding:"required"`
	RequestedBy   string    `json:"requested_by" binding:"required"`
	CashBankID    string    `json:"cash_bank_id" binding:"required"`
	Amount        float64   `json:"amount" binding:"required,min=0"`
	Purpose       string    `json:"purpose" binding:"required"`
	Description   string    `json:"description"`
	Status        string    `json:"status" binding:"required,oneof=pending approved rejected disbursed"`
}

type ApproveExpenditureRequestRequest struct {
	ApprovedBy string `json:"approved_by" binding:"required"`
}

type RejectExpenditureRequestRequest struct {
	RejectedReason string `json:"rejected_reason" binding:"required"`
}

type DisburseExpenditureRequestRequest struct {
	DisbursedBy string `json:"disbursed_by" binding:"required"`
}

type ExpenditureRequestResponse struct {
	ID             string    `json:"id"`
	RequestNumber  string    `json:"request_number"`
	RequestDate    time.Time `json:"request_date"`
	RequestedBy    string    `json:"requested_by"`
	CashBankID     string    `json:"cash_bank_id"`
	Amount         float64   `json:"amount"`
	Purpose        string    `json:"purpose"`
	Description    string    `json:"description"`
	Status         string    `json:"status"`
	ApprovedBy     string    `json:"approved_by"`
	ApprovedAt     time.Time `json:"approved_at"`
	DisbursedBy    string    `json:"disbursed_by"`
	DisbursedAt    time.Time `json:"disbursed_at"`
	RejectedReason string    `json:"rejected_reason"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func ToExpenditureRequestResponse(request *entities.ExpenditureRequest) *ExpenditureRequestResponse {
	return &ExpenditureRequestResponse{
		ID:             request.ID,
		RequestNumber:  request.RequestNumber,
		RequestDate:    request.RequestDate,
		RequestedBy:    request.RequestedBy,
		CashBankID:     request.CashBankID,
		Amount:         request.Amount,
		Purpose:        request.Purpose,
		Description:    request.Description,
		Status:         request.Status,
		ApprovedBy:     request.ApprovedBy,
		ApprovedAt:     request.ApprovedAt,
		DisbursedBy:    request.DisbursedBy,
		DisbursedAt:    request.DisbursedAt,
		RejectedReason: request.RejectedReason,
		CreatedAt:      request.CreatedAt,
		UpdatedAt:      request.UpdatedAt,
	}
}

func ToExpenditureRequestEntity(req *CreateExpenditureRequestRequest) *entities.ExpenditureRequest {
	return &entities.ExpenditureRequest{
		RequestNumber: req.RequestNumber,
		RequestDate:   req.RequestDate,
		RequestedBy:   req.RequestedBy,
		CashBankID:    req.CashBankID,
		Amount:        req.Amount,
		Purpose:       req.Purpose,
		Description:   req.Description,
	}
}