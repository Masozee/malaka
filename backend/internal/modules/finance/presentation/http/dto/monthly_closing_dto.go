package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
)

type CreateMonthlyClosingRequest struct {
	PeriodYear         int     `json:"period_year" binding:"required,min=2020"`
	PeriodMonth        int     `json:"period_month" binding:"required,min=1,max=12"`
	ClosingDate        string  `json:"closing_date" binding:"required"`
	TotalRevenue       float64 `json:"total_revenue"`
	TotalExpenses      float64 `json:"total_expenses"`
	CashPosition       float64 `json:"cash_position"`
	BankPosition       float64 `json:"bank_position"`
	AccountsReceivable float64 `json:"accounts_receivable"`
	AccountsPayable    float64 `json:"accounts_payable"`
	InventoryValue     float64 `json:"inventory_value"`
}

type UpdateMonthlyClosingRequest struct {
	PeriodYear         int     `json:"period_year" binding:"required,min=2020"`
	PeriodMonth        int     `json:"period_month" binding:"required,min=1,max=12"`
	ClosingDate        string  `json:"closing_date" binding:"required"`
	TotalRevenue       float64 `json:"total_revenue"`
	TotalExpenses      float64 `json:"total_expenses"`
	CashPosition       float64 `json:"cash_position"`
	BankPosition       float64 `json:"bank_position"`
	AccountsReceivable float64 `json:"accounts_receivable"`
	AccountsPayable    float64 `json:"accounts_payable"`
	InventoryValue     float64 `json:"inventory_value"`
	Status             string  `json:"status" binding:"required,oneof=OPEN CLOSED LOCKED"`
}

type CloseMonthRequest struct {
	ClosedBy string `json:"closed_by" binding:"required"`
}

type MonthlyClosingResponse struct {
	ID                 string    `json:"id"`
	PeriodYear         int       `json:"period_year"`
	PeriodMonth        int       `json:"period_month"`
	ClosingDate        time.Time `json:"closing_date"`
	TotalRevenue       float64   `json:"total_revenue"`
	TotalExpenses      float64   `json:"total_expenses"`
	NetIncome          float64   `json:"net_income"`
	CashPosition       float64   `json:"cash_position"`
	BankPosition       float64   `json:"bank_position"`
	AccountsReceivable float64   `json:"accounts_receivable"`
	AccountsPayable    float64   `json:"accounts_payable"`
	InventoryValue     float64   `json:"inventory_value"`
	Status             string    `json:"status"`
	ClosedBy           string    `json:"closed_by"`
	ClosedAt           time.Time `json:"closed_at"`
	CreatedAt          time.Time `json:"created_at"`
}

func ToMonthlyClosingResponse(closing *entities.MonthlyClosing) *MonthlyClosingResponse {
	return &MonthlyClosingResponse{
		ID:                 closing.ID.String(),
		PeriodYear:         closing.PeriodYear,
		PeriodMonth:        closing.PeriodMonth,
		ClosingDate:        closing.ClosingDate,
		TotalRevenue:       closing.TotalRevenue,
		TotalExpenses:      closing.TotalExpenses,
		NetIncome:          closing.NetIncome,
		CashPosition:       closing.CashPosition,
		BankPosition:       closing.BankPosition,
		AccountsReceivable: closing.AccountsReceivable,
		AccountsPayable:    closing.AccountsPayable,
		InventoryValue:     closing.InventoryValue,
		Status:             closing.Status,
		ClosedBy:           closing.ClosedBy.String(),
		ClosedAt:           closing.ClosedAt,
		CreatedAt:          closing.CreatedAt,
	}
}

func ToMonthlyClosingEntity(req *CreateMonthlyClosingRequest) *entities.MonthlyClosing {
	closingDate, _ := time.Parse("2006-01-02", req.ClosingDate)
	if closingDate.IsZero() {
		closingDate, _ = time.Parse(time.RFC3339, req.ClosingDate)
	}

	return &entities.MonthlyClosing{
		PeriodYear:         req.PeriodYear,
		PeriodMonth:        req.PeriodMonth,
		ClosingDate:        closingDate,
		TotalRevenue:       req.TotalRevenue,
		TotalExpenses:      req.TotalExpenses,
		CashPosition:       req.CashPosition,
		BankPosition:       req.BankPosition,
		AccountsReceivable: req.AccountsReceivable,
		AccountsPayable:    req.AccountsPayable,
		InventoryValue:     req.InventoryValue,
	}
}
