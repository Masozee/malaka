package dto

import (
	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// FinancialForecastCreateRequest represents the request to create a financial forecast.
type FinancialForecastCreateRequest struct {
	ScenarioName     string  `json:"scenario_name" binding:"required"`
	Type             string  `json:"type" binding:"required"`
	FiscalYear       string  `json:"fiscal_year" binding:"required"`
	ProjectedRevenue float64 `json:"projected_revenue"`
	ProjectedEbitda  float64 `json:"projected_ebitda"`
	GrowthRate       float64 `json:"growth_rate"`
	Status           string  `json:"status" binding:"required"`
	CompanyID        string  `json:"company_id"`
}

// FinancialForecastUpdateRequest represents the request to update a financial forecast.
type FinancialForecastUpdateRequest struct {
	ScenarioName     string  `json:"scenario_name"`
	Type             string  `json:"type"`
	FiscalYear       string  `json:"fiscal_year"`
	ProjectedRevenue float64 `json:"projected_revenue"`
	ProjectedEbitda  float64 `json:"projected_ebitda"`
	GrowthRate       float64 `json:"growth_rate"`
	Status           string  `json:"status"`
	CompanyID        string  `json:"company_id"`
}

// FinancialForecastResponse represents the response for a financial forecast.
type FinancialForecastResponse struct {
	ID               string  `json:"id"`
	ScenarioName     string  `json:"scenario_name"`
	Type             string  `json:"type"`
	FiscalYear       string  `json:"fiscal_year"`
	ProjectedRevenue float64 `json:"projected_revenue"`
	ProjectedEbitda  float64 `json:"projected_ebitda"`
	GrowthRate       float64 `json:"growth_rate"`
	Status           string  `json:"status"`
	CompanyID        string  `json:"company_id"`
	CreatedAt        string  `json:"created_at"`
	UpdatedAt        string  `json:"updated_at"`
}

// ToFinancialForecastEntity converts FinancialForecastCreateRequest to entities.FinancialForecast.
func (req *FinancialForecastCreateRequest) ToFinancialForecastEntity() *entities.FinancialForecast {
	return &entities.FinancialForecast{
		BaseModel:        types.BaseModel{},
		ScenarioName:     req.ScenarioName,
		Type:             req.Type,
		FiscalYear:       req.FiscalYear,
		ProjectedRevenue: req.ProjectedRevenue,
		ProjectedEbitda:  req.ProjectedEbitda,
		GrowthRate:       req.GrowthRate,
		Status:           req.Status,
		CompanyID:        req.CompanyID,
	}
}

// ToFinancialForecastEntity converts FinancialForecastUpdateRequest to entities.FinancialForecast.
func (req *FinancialForecastUpdateRequest) ToFinancialForecastEntity() *entities.FinancialForecast {
	return &entities.FinancialForecast{
		BaseModel:        types.BaseModel{},
		ScenarioName:     req.ScenarioName,
		Type:             req.Type,
		FiscalYear:       req.FiscalYear,
		ProjectedRevenue: req.ProjectedRevenue,
		ProjectedEbitda:  req.ProjectedEbitda,
		GrowthRate:       req.GrowthRate,
		Status:           req.Status,
		CompanyID:        req.CompanyID,
	}
}

// FromFinancialForecastEntity converts entities.FinancialForecast to FinancialForecastResponse.
func FromFinancialForecastEntity(ff *entities.FinancialForecast) *FinancialForecastResponse {
	return &FinancialForecastResponse{
		ID:               ff.ID.String(),
		ScenarioName:     ff.ScenarioName,
		Type:             ff.Type,
		FiscalYear:       ff.FiscalYear,
		ProjectedRevenue: ff.ProjectedRevenue,
		ProjectedEbitda:  ff.ProjectedEbitda,
		GrowthRate:       ff.GrowthRate,
		Status:           ff.Status,
		CompanyID:        ff.CompanyID,
		CreatedAt:        ff.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:        ff.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
