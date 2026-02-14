package entities

import (
	"malaka/internal/shared/types"
)

// FinancialForecast represents a financial forecast entity.
type FinancialForecast struct {
	types.BaseModel
	ScenarioName    string  `json:"scenario_name" db:"scenario_name"`
	Type            string  `json:"type" db:"type"`
	FiscalYear      string  `json:"fiscal_year" db:"fiscal_year"`
	ProjectedRevenue float64 `json:"projected_revenue" db:"projected_revenue"`
	ProjectedEbitda float64 `json:"projected_ebitda" db:"projected_ebitda"`
	GrowthRate      float64 `json:"growth_rate" db:"growth_rate"`
	Status          string  `json:"status" db:"status"`
	CompanyID       string  `json:"company_id" db:"company_id"`
}
