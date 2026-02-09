package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

type CreateCheckClearanceRequest struct {
	CheckNumber   string    `json:"check_number" binding:"required"`
	CheckDate     time.Time `json:"check_date" binding:"required"`
	BankName      string    `json:"bank_name" binding:"required"`
	Amount        float64   `json:"amount" binding:"required,min=0"`
	PayeeID       string    `json:"payee_id" binding:"required"`
	PayeeName     string    `json:"payee_name" binding:"required"`
	CashBankID    string    `json:"cash_bank_id" binding:"required"`
	ClearanceDate time.Time `json:"clearance_date"`
	Description   string    `json:"description"`
	IsIncoming    bool      `json:"is_incoming"`
}

type UpdateCheckClearanceRequest struct {
	CheckNumber   string    `json:"check_number" binding:"required"`
	CheckDate     time.Time `json:"check_date" binding:"required"`
	BankName      string    `json:"bank_name" binding:"required"`
	Amount        float64   `json:"amount" binding:"required,min=0"`
	PayeeID       string    `json:"payee_id" binding:"required"`
	PayeeName     string    `json:"payee_name" binding:"required"`
	CashBankID    string    `json:"cash_bank_id" binding:"required"`
	ClearanceDate time.Time `json:"clearance_date"`
	Status        string    `json:"status" binding:"required,oneof=issued presented cleared bounced cancelled"`
	Description   string    `json:"description"`
	IsIncoming    bool      `json:"is_incoming"`
}

type ClearCheckRequest struct {
	ClearanceDate time.Time `json:"clearance_date" binding:"required"`
}

type CheckClearanceResponse struct {
	ID            string    `json:"id"`
	CheckNumber   string    `json:"check_number"`
	CheckDate     time.Time `json:"check_date"`
	BankName      string    `json:"bank_name"`
	Amount        float64   `json:"amount"`
	PayeeID       string    `json:"payee_id"`
	PayeeName     string    `json:"payee_name"`
	CashBankID    string    `json:"cash_bank_id"`
	ClearanceDate time.Time `json:"clearance_date"`
	Status        string    `json:"status"`
	Description   string    `json:"description"`
	IsIncoming    bool      `json:"is_incoming"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func ToCheckClearanceResponse(check *entities.CheckClearance) *CheckClearanceResponse {
	return &CheckClearanceResponse{
		ID:            check.ID.String(),
		CheckNumber:   check.CheckNumber,
		CheckDate:     check.CheckDate,
		BankName:      check.BankName,
		Amount:        check.Amount,
		PayeeID:       check.PayeeID.String(),
		PayeeName:     check.PayeeName,
		CashBankID:    check.CashBankID.String(),
		ClearanceDate: check.ClearanceDate,
		Status:        check.Status,
		Description:   check.Description,
		IsIncoming:    check.IsIncoming,
		CreatedAt:     check.CreatedAt,
		UpdatedAt:     check.UpdatedAt,
	}
}

func ToCheckClearanceEntity(req *CreateCheckClearanceRequest) *entities.CheckClearance {
	return &entities.CheckClearance{
		CheckNumber:   req.CheckNumber,
		CheckDate:     req.CheckDate,
		BankName:      req.BankName,
		Amount:        req.Amount,
		PayeeID:       uuid.MustParse(req.PayeeID),
		PayeeName:     req.PayeeName,
		CashBankID:    uuid.MustParse(req.CashBankID),
		ClearanceDate: req.ClearanceDate,
		Description:   req.Description,
		IsIncoming:    req.IsIncoming,
	}
}
