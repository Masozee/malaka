package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
)

type CreateExpenditureRequestRequest struct {
	RequestNumber string    `json:"request_number" binding:"required"`
	RequestorID   string    `json:"requestor_id" binding:"required"`
	Department    string    `json:"department"`
	RequestDate   time.Time `json:"request_date" binding:"required"`
	RequiredDate  time.Time `json:"required_date"`
	Purpose       string    `json:"purpose" binding:"required"`
	TotalAmount   float64   `json:"total_amount" binding:"required,min=0"`
	Priority      string    `json:"priority"`
	Remarks       string    `json:"remarks"`
}

type UpdateExpenditureRequestRequest struct {
	RequestNumber  string    `json:"request_number" binding:"required"`
	RequestorID    string    `json:"requestor_id" binding:"required"`
	Department     string    `json:"department"`
	RequestDate    time.Time `json:"request_date" binding:"required"`
	RequiredDate   time.Time `json:"required_date"`
	Purpose        string    `json:"purpose" binding:"required"`
	TotalAmount    float64   `json:"total_amount" binding:"required,min=0"`
	ApprovedAmount float64   `json:"approved_amount" binding:"min=0"`
	Priority       string    `json:"priority"`
	Status         string    `json:"status" binding:"required,oneof=PENDING APPROVED REJECTED PROCESSED"`
	Remarks        string    `json:"remarks"`
}

type ApproveExpenditureRequestRequest struct {
	ApprovedBy string `json:"approved_by" binding:"required"`
}

type RejectExpenditureRequestRequest struct {
	Remarks string `json:"remarks" binding:"required"`
}

type ProcessExpenditureRequestRequest struct {
	ProcessedBy string `json:"processed_by" binding:"required"`
}

type ExpenditureRequestResponse struct {
	ID             string    `json:"id"`
	RequestNumber  string    `json:"request_number"`
	RequestorID    string    `json:"requestor_id"`
	Department     string    `json:"department"`
	RequestDate    time.Time `json:"request_date"`
	RequiredDate   time.Time `json:"required_date"`
	Purpose        string    `json:"purpose"`
	TotalAmount    float64   `json:"total_amount"`
	ApprovedAmount float64   `json:"approved_amount"`
	Status         string    `json:"status"`
	Priority       string    `json:"priority"`
	ApprovedBy     string    `json:"approved_by"`
	ApprovedAt     time.Time `json:"approved_at"`
	ProcessedBy    string    `json:"processed_by"`
	ProcessedAt    time.Time `json:"processed_at"`
	Remarks        string    `json:"remarks"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func ToExpenditureRequestResponse(request *entities.ExpenditureRequest) *ExpenditureRequestResponse {
	return &ExpenditureRequestResponse{
		ID:             request.ID.String(),
		RequestNumber:  request.RequestNumber,
		RequestorID:    request.RequestorID.String(),
		Department:     request.Department,
		RequestDate:    request.RequestDate,
		RequiredDate:   request.RequiredDate,
		Purpose:        request.Purpose,
		TotalAmount:    request.TotalAmount,
		ApprovedAmount: request.ApprovedAmount,
		Status:         request.Status,
		Priority:       request.Priority,
		ApprovedBy:     request.ApprovedBy.String(),
		ApprovedAt:     request.ApprovedAt,
		ProcessedBy:    request.ProcessedBy.String(),
		ProcessedAt:    request.ProcessedAt,
		Remarks:        request.Remarks,
		CreatedAt:      request.CreatedAt,
		UpdatedAt:      request.UpdatedAt,
	}
}

func ToExpenditureRequestEntity(req *CreateExpenditureRequestRequest) *entities.ExpenditureRequest {
	return &entities.ExpenditureRequest{
		RequestNumber: req.RequestNumber,
		RequestorID:   safeParseUUID(req.RequestorID),
		Department:    req.Department,
		RequestDate:   req.RequestDate,
		RequiredDate:  req.RequiredDate,
		Purpose:       req.Purpose,
		TotalAmount:   req.TotalAmount,
		Priority:      req.Priority,
		Remarks:       req.Remarks,
	}
}
