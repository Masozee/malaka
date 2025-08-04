package dto

import (
	"strings"
	"time"

	"malaka/internal/modules/hr/domain/entities"
)

// PayrollPeriodResponse represents the response structure for payroll periods
type PayrollPeriodResponse struct {
	ID                  string     `json:"id"`
	Year                int        `json:"year"`
	Month               int        `json:"month"`
	StartDate           string     `json:"startDate"`
	EndDate             string     `json:"endDate"`
	Status              string     `json:"status"`
	TotalEmployees      int        `json:"totalEmployees"`
	TotalGrossPay       float64    `json:"totalGrossPay"`
	TotalDeductions     float64    `json:"totalDeductions"`
	TotalNetPay         float64    `json:"totalNetPay"`
	ProcessedAt         *string    `json:"processedAt,omitempty"`
	ProcessedBy         *string    `json:"processedBy,omitempty"`
	CreatedAt           string     `json:"createdAt"`
	UpdatedAt           string     `json:"updatedAt"`
}

// PayrollPeriodRequest represents the request structure for creating/updating payroll periods
type PayrollPeriodRequest struct {
	Year           int    `json:"year" binding:"required,min=2020,max=2030"`
	Month          int    `json:"month" binding:"required,min=1,max=12"`
	TotalEmployees int    `json:"totalEmployees,omitempty"`
	Status         string `json:"status,omitempty"`
}

// SalaryCalculationResponse represents the response structure for salary calculations
type SalaryCalculationResponse struct {
	ID                string  `json:"id"`
	EmployeeID        string  `json:"employeeId"`
	Employee          *EmployeeBasicInfo `json:"employee,omitempty"`
	PeriodYear        int     `json:"periodYear"`
	PeriodMonth       int     `json:"periodMonth"`
	BasicSalary       float64 `json:"basicSalary"`
	Allowances        float64 `json:"allowances"`
	OvertimeAmount    float64 `json:"overtimeAmount"`
	CommissionAmount  float64 `json:"commissionAmount"`
	BonusAmount       float64 `json:"bonusAmount"`
	GrossSalary       float64 `json:"grossSalary"`
	TaxDeduction      float64 `json:"taxDeduction"`
	InsuranceDeduction float64 `json:"insuranceDeduction"`
	LoanDeduction     float64 `json:"loanDeduction"`
	OtherDeductions   float64 `json:"otherDeductions"`
	TotalDeductions   float64 `json:"totalDeductions"`
	NetSalary         float64 `json:"netSalary"`
	Status            string  `json:"status"`
	CreatedAt         string  `json:"createdAt"`
	UpdatedAt         string  `json:"updatedAt"`
}

// SalaryCalculationRequest represents the request structure for salary calculations
type SalaryCalculationRequest struct {
	EmployeeID       string  `json:"employeeId" binding:"required"`
	PeriodYear       int     `json:"periodYear" binding:"required,min=2020,max=2030"`
	PeriodMonth      int     `json:"periodMonth" binding:"required,min=1,max=12"`
	BasicSalary      float64 `json:"basicSalary" binding:"required,min=0"`
	Allowances       float64 `json:"allowances,omitempty"`
	OvertimeAmount   float64 `json:"overtimeAmount,omitempty"`
	CommissionAmount float64 `json:"commissionAmount,omitempty"`
	BonusAmount      float64 `json:"bonusAmount,omitempty"`
	TaxDeduction     float64 `json:"taxDeduction,omitempty"`
	InsuranceDeduction float64 `json:"insuranceDeduction,omitempty"`
	LoanDeduction    float64 `json:"loanDeduction,omitempty"`
	OtherDeductions  float64 `json:"otherDeductions,omitempty"`
}

// EmployeeBasicInfo represents basic employee information for payroll
type EmployeeBasicInfo struct {
	ID           string `json:"id"`
	EmployeeCode string `json:"employeeCode"`
	Name         string `json:"name"`
	Position     string `json:"position"`
	Department   string `json:"department"`
}

// ToPayrollPeriodResponse converts a PayrollPeriod entity to response DTO
func ToPayrollPeriodResponse(period *entities.PayrollPeriod) *PayrollPeriodResponse {
	response := &PayrollPeriodResponse{
		ID:                  period.ID.String(),
		Year:                period.PeriodYear,
		Month:               period.PeriodMonth,
		StartDate:           period.StartDate().Format("2006-01-02"),
		EndDate:             period.EndDate().Format("2006-01-02"),
		Status:              strings.ToLower(period.Status),
		TotalEmployees:      period.TotalEmployees,
		TotalGrossPay:       period.TotalGrossSalary,
		TotalDeductions:     period.TotalDeductions,
		TotalNetPay:         period.TotalNetSalary,
		CreatedAt:           period.CreatedAt.Format(time.RFC3339),
		UpdatedAt:           period.CreatedAt.Format(time.RFC3339),
	}

	if period.ApprovedAt != nil {
		processedAt := period.ApprovedAt.Format(time.RFC3339)
		response.ProcessedAt = &processedAt
	}

	return response
}

// ToSalaryCalculationResponse converts a SalaryCalculation entity to response DTO
func ToSalaryCalculationResponse(calc *entities.SalaryCalculation) *SalaryCalculationResponse {
	response := &SalaryCalculationResponse{
		ID:                calc.ID.String(),
		EmployeeID:        calc.EmployeeID.String(),
		PeriodYear:        calc.PeriodYear,
		PeriodMonth:       calc.PeriodMonth,
		BasicSalary:       calc.BasicSalary,
		Allowances:        calc.Allowances,
		OvertimeAmount:    calc.OvertimeAmount,
		CommissionAmount:  calc.CommissionAmount,
		BonusAmount:       calc.BonusAmount,
		GrossSalary:       calc.GrossSalary,
		TaxDeduction:      calc.TaxDeduction,
		InsuranceDeduction: calc.InsuranceDeduction,
		LoanDeduction:     calc.LoanDeduction,
		OtherDeductions:   calc.OtherDeductions,
		TotalDeductions:   calc.TotalDeductions,
		NetSalary:         calc.NetSalary,
		Status:            strings.ToLower(calc.Status),
		CreatedAt:         calc.CreatedAt.Format(time.RFC3339),
		UpdatedAt:         calc.CreatedAt.Format(time.RFC3339),
	}

	if calc.Employee != nil {
		response.Employee = &EmployeeBasicInfo{
			ID:           calc.Employee.ID.String(),
			EmployeeCode: calc.Employee.EmployeeCode,
			Name:         calc.Employee.EmployeeName,
			Position:     calc.Employee.Position,
			Department:   calc.Employee.Department,
		}
	}

	return response
}