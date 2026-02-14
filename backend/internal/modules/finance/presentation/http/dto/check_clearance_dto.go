package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
)

type CreateCheckClearanceRequest struct {
	CheckNumber   string    `json:"check_number" binding:"required"`
	CheckDate     time.Time `json:"check_date" binding:"required"`
	BankName      string    `json:"bank_name" binding:"required"`
	AccountNumber string    `json:"account_number"`
	Amount        float64   `json:"amount" binding:"required,min=0"`
	PayeeName     string    `json:"payee_name" binding:"required"`
	ClearanceDate time.Time `json:"clearance_date"`
	Memo          string    `json:"memo"`
}

type UpdateCheckClearanceRequest struct {
	CheckNumber   string    `json:"check_number" binding:"required"`
	CheckDate     time.Time `json:"check_date" binding:"required"`
	BankName      string    `json:"bank_name" binding:"required"`
	AccountNumber string    `json:"account_number"`
	Amount        float64   `json:"amount" binding:"required,min=0"`
	PayeeName     string    `json:"payee_name" binding:"required"`
	ClearanceDate time.Time `json:"clearance_date"`
	Status        string    `json:"status" binding:"required,oneof=ISSUED PRESENTED CLEARED BOUNCED CANCELLED"`
	Memo          string    `json:"memo"`
}

type ClearCheckRequest struct {
	ClearanceDate time.Time `json:"clearance_date" binding:"required"`
}

type CheckClearanceResponse struct {
	ID            string    `json:"id"`
	CheckNumber   string    `json:"check_number"`
	CheckDate     time.Time `json:"check_date"`
	BankName      string    `json:"bank_name"`
	AccountNumber string    `json:"account_number"`
	Amount        float64   `json:"amount"`
	PayeeName     string    `json:"payee_name"`
	ClearanceDate time.Time `json:"clearance_date"`
	Status        string    `json:"status"`
	Memo          string    `json:"memo"`
	ClearedBy     string    `json:"cleared_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func ToCheckClearanceResponse(check *entities.CheckClearance) *CheckClearanceResponse {
	return &CheckClearanceResponse{
		ID:            check.ID.String(),
		CheckNumber:   check.CheckNumber,
		CheckDate:     check.CheckDate,
		BankName:      check.BankName,
		AccountNumber: check.AccountNumber,
		Amount:        check.Amount,
		PayeeName:     check.PayeeName,
		ClearanceDate: check.ClearanceDate,
		Status:        check.Status,
		Memo:          check.Memo,
		ClearedBy:     check.ClearedBy.String(),
		CreatedAt:     check.CreatedAt,
		UpdatedAt:     check.UpdatedAt,
	}
}

func ToCheckClearanceEntity(req *CreateCheckClearanceRequest) *entities.CheckClearance {
	return &entities.CheckClearance{
		CheckNumber:   req.CheckNumber,
		CheckDate:     req.CheckDate,
		BankName:      req.BankName,
		AccountNumber: req.AccountNumber,
		Amount:        req.Amount,
		PayeeName:     req.PayeeName,
		ClearanceDate: req.ClearanceDate,
		Memo:          req.Memo,
	}
}
