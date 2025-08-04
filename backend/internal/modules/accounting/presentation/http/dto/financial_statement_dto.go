package dto

import (
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// BalanceSheetResponse represents the response structure for a Balance Sheet
type BalanceSheetResponse struct {
	ID        uuid.UUID `json:"id"`
	CompanyID string    `json:"company_id"`
	AsOfDate  time.Time `json:"as_of_date"`
	Assets    float64   `json:"assets"`
	Liabilities float64   `json:"liabilities"`
	Equity    float64   `json:"equity"`
	// Add detailed breakdown of assets, liabilities, equity if needed
}

// IncomeStatementResponse represents the response structure for an Income Statement
type IncomeStatementResponse struct {
	ID          uuid.UUID `json:"id"`
	CompanyID   string    `json:"company_id"`
	PeriodStart time.Time `json:"period_start"`
	PeriodEnd   time.Time `json:"period_end"`
	Revenues    float64   `json:"revenues"`
	Expenses    float64   `json:"expenses"`
	NetIncome   float64   `json:"net_income"`
	// Add detailed breakdown of revenues and expenses if needed
}

// CashFlowStatementResponse represents the response structure for a Cash Flow Statement
type CashFlowStatementResponse struct {
	ID                      uuid.UUID `json:"id"`
	CompanyID               string    `json:"company_id"`
	PeriodStart             time.Time `json:"period_start"`
	PeriodEnd               time.Time `json:"period_end"`
	OperatingActivities     float64   `json:"operating_activities"`
	InvestingActivities     float64   `json:"investing_activities"`
	FinancingActivities     float64   `json:"financing_activities"`
	NetCashFlow             float64   `json:"net_cash_flow"`
	// Add detailed breakdown of cash flow activities if needed
}

// MapBalanceSheetEntityToResponse maps a BalanceSheet entity to its response DTO
func MapBalanceSheetEntityToResponse(entity *entities.BalanceSheet) *BalanceSheetResponse {
	if entity == nil {
		return nil
	}
	return &BalanceSheetResponse{
		ID:        entity.ID,
		CompanyID: entity.CompanyID,
		AsOfDate:  entity.PeriodEnd, // Using PeriodEnd as AsOfDate for balance sheet
		Assets:    entity.TotalAssets,
		Liabilities: entity.TotalLiabilities,
		Equity:    entity.TotalEquity,
	}
}

// MapIncomeStatementEntityToResponse maps an IncomeStatement entity to its response DTO
func MapIncomeStatementEntityToResponse(entity *entities.IncomeStatement) *IncomeStatementResponse {
	if entity == nil {
		return nil
	}
	return &IncomeStatementResponse{
		ID:          entity.ID,
		CompanyID:   entity.CompanyID,
		PeriodStart: entity.PeriodStart,
		PeriodEnd:   entity.PeriodEnd,
		Revenues:    entity.TotalRevenue,
		Expenses:    entity.TotalExpenses,
		NetIncome:   entity.NetIncome,
	}
}

// MapCashFlowStatementEntityToResponse maps a CashFlowStatement entity to its response DTO
func MapCashFlowStatementEntityToResponse(entity *entities.CashFlowStatement) *CashFlowStatementResponse {
	if entity == nil {
		return nil
	}
	return &CashFlowStatementResponse{
		ID:                      entity.ID,
		CompanyID:               entity.CompanyID,
		PeriodStart:             entity.PeriodStart,
		PeriodEnd:               entity.PeriodEnd,
		OperatingActivities:     entity.OperatingCashFlow,
		InvestingActivities:     entity.InvestingCashFlow,
		FinancingActivities:     entity.FinancingCashFlow,
		NetCashFlow:             entity.NetCashFlow,
	}
}
