package entities

import (
	"strings"
	"time"

	"malaka/internal/shared/uuid"
)

// SalaryCalculation represents salary calculation for an employee in a specific period
type SalaryCalculation struct {
	ID                 uuid.ID    `json:"id" db:"id"`
	EmployeeID         uuid.ID    `json:"employee_id" db:"employee_id"`
	PeriodYear         int        `json:"period_year" db:"period_year"`
	PeriodMonth        int        `json:"period_month" db:"period_month"`
	BasicSalary        float64    `json:"basic_salary" db:"basic_salary"`
	Allowances         float64    `json:"allowances" db:"allowances"`
	OvertimeAmount     float64    `json:"overtime_amount" db:"overtime_amount"`
	CommissionAmount   float64    `json:"commission_amount" db:"commission_amount"`
	BonusAmount        float64    `json:"bonus_amount" db:"bonus_amount"`
	GrossSalary        float64    `json:"gross_salary" db:"gross_salary"`
	TaxDeduction       float64    `json:"tax_deduction" db:"tax_deduction"`
	InsuranceDeduction float64    `json:"insurance_deduction" db:"insurance_deduction"`
	LoanDeduction      float64    `json:"loan_deduction" db:"loan_deduction"`
	OtherDeductions    float64    `json:"other_deductions" db:"other_deductions"`
	TotalDeductions    float64    `json:"total_deductions" db:"total_deductions"`
	NetSalary          float64    `json:"net_salary" db:"net_salary"`
	Status             string     `json:"status" db:"status"`
	CalculatedBy       *uuid.ID   `json:"calculated_by" db:"calculated_by"`
	CalculatedAt       *time.Time `json:"calculated_at" db:"calculated_at"`
	CreatedAt          time.Time  `json:"created_at" db:"created_at"`

	// Associated employee data (for joins)
	Employee *Employee `json:"employee,omitempty"`
}

// SalaryCalculationStatus constants
const (
	SalaryStatusDraft      = "DRAFT"
	SalaryStatusCalculated = "CALCULATED"
	SalaryStatusApproved   = "APPROVED"
	SalaryStatusPaid       = "PAID"
)

// TableName returns the table name for the entity
func (SalaryCalculation) TableName() string {
	return "salary_calculation"
}

// CalculateGrossSalary calculates the gross salary from components
func (s *SalaryCalculation) CalculateGrossSalary() {
	s.GrossSalary = s.BasicSalary + s.Allowances + s.OvertimeAmount + s.CommissionAmount + s.BonusAmount
}

// CalculateTotalDeductions calculates the total deductions
func (s *SalaryCalculation) CalculateTotalDeductions() {
	s.TotalDeductions = s.TaxDeduction + s.InsuranceDeduction + s.LoanDeduction + s.OtherDeductions
}

// CalculateNetSalary calculates the net salary
func (s *SalaryCalculation) CalculateNetSalary() {
	s.NetSalary = s.GrossSalary - s.TotalDeductions
}

// CalculateAll performs all salary calculations
func (s *SalaryCalculation) CalculateAll() {
	s.CalculateGrossSalary()
	s.CalculateTotalDeductions()
	s.CalculateNetSalary()
}

// IsEditable checks if the salary calculation can be edited
func (s *SalaryCalculation) IsEditable() bool {
	return s.Status == SalaryStatusDraft
}

// CanBeApproved checks if the salary calculation can be approved
func (s *SalaryCalculation) CanBeApproved() bool {
	return s.Status == SalaryStatusCalculated
}

// CanBePaid checks if the salary calculation can be marked as paid
func (s *SalaryCalculation) CanBePaid() bool {
	return s.Status == SalaryStatusApproved
}

// PayrollItemDTO represents the frontend-expected structure for payroll items
type PayrollItemDTO struct {
	ID              string                `json:"id"`
	PayrollPeriodID string                `json:"payrollPeriodId"`
	EmployeeID      string                `json:"employeeId"`
	Employee        *PayrollEmployeeDTO   `json:"employee"`
	BasicSalary     float64               `json:"basicSalary"`
	Allowances      []PayrollAllowanceDTO `json:"allowances"`
	Deductions      []PayrollDeductionDTO `json:"deductions"`
	Overtime        []PayrollOvertimeDTO  `json:"overtime"`
	GrossPay        float64               `json:"grossPay"`
	TotalDeductions float64               `json:"totalDeductions"`
	NetPay          float64               `json:"netPay"`
	Status          string                `json:"status"`
	Notes           string                `json:"notes,omitempty"`
	CreatedAt       string                `json:"createdAt"`
	UpdatedAt       string                `json:"updatedAt"`
}

type PayrollEmployeeDTO struct {
	ID         string `json:"id"`
	EmployeeID string `json:"employeeId"`
	Name       string `json:"name"`
	Position   string `json:"position"`
	Department string `json:"department"`
}

type PayrollAllowanceDTO struct {
	ID        string  `json:"id"`
	Type      string  `json:"type"`
	Name      string  `json:"name"`
	Amount    float64 `json:"amount"`
	IsTaxable bool    `json:"isTaxable"`
}

type PayrollDeductionDTO struct {
	ID       string  `json:"id"`
	Type     string  `json:"type"`
	Name     string  `json:"name"`
	Amount   float64 `json:"amount"`
	IsPreTax bool    `json:"isPreTax"`
}

type PayrollOvertimeDTO struct {
	ID          string  `json:"id"`
	Date        string  `json:"date"`
	Hours       float64 `json:"hours"`
	Rate        float64 `json:"rate"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description,omitempty"`
}

// ToPayrollItemDTO converts SalaryCalculation to PayrollItemDTO
func (s *SalaryCalculation) ToPayrollItemDTO() *PayrollItemDTO {
	dto := &PayrollItemDTO{
		ID:              s.ID.String(),
		PayrollPeriodID: "", // Will be set by the period
		EmployeeID:      s.EmployeeID.String(),
		BasicSalary:     s.BasicSalary,
		GrossPay:        s.GrossSalary,
		TotalDeductions: s.TotalDeductions,
		NetPay:          s.NetSalary,
		Status:          strings.ToLower(s.Status),
		CreatedAt:       s.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       s.CreatedAt.Format(time.RFC3339),
		Allowances:      []PayrollAllowanceDTO{},
		Deductions:      []PayrollDeductionDTO{},
		Overtime:        []PayrollOvertimeDTO{},
	}

	// Convert employee data if available
	if s.Employee != nil {
		dto.Employee = &PayrollEmployeeDTO{
			ID:         s.Employee.ID.String(),
			EmployeeID: s.Employee.EmployeeCode,
			Name:       s.Employee.EmployeeName,
			Position:   s.Employee.Position,
			Department: s.Employee.Department,
		}
	}

	// Add allowances breakdown
	if s.Allowances > 0 {
		dto.Allowances = append(dto.Allowances, PayrollAllowanceDTO{
			ID:        uuid.NewString(),
			Type:      "allowances",
			Name:      "Total Allowances",
			Amount:    s.Allowances,
			IsTaxable: true,
		})
	}

	if s.OvertimeAmount > 0 {
		dto.Allowances = append(dto.Allowances, PayrollAllowanceDTO{
			ID:        uuid.NewString(),
			Type:      "overtime",
			Name:      "Overtime Pay",
			Amount:    s.OvertimeAmount,
			IsTaxable: true,
		})
	}

	if s.CommissionAmount > 0 {
		dto.Allowances = append(dto.Allowances, PayrollAllowanceDTO{
			ID:        uuid.NewString(),
			Type:      "commission",
			Name:      "Sales Commission",
			Amount:    s.CommissionAmount,
			IsTaxable: true,
		})
	}

	if s.BonusAmount > 0 {
		dto.Allowances = append(dto.Allowances, PayrollAllowanceDTO{
			ID:        uuid.NewString(),
			Type:      "bonus",
			Name:      "Performance Bonus",
			Amount:    s.BonusAmount,
			IsTaxable: true,
		})
	}

	// Add deductions breakdown
	if s.TaxDeduction > 0 {
		dto.Deductions = append(dto.Deductions, PayrollDeductionDTO{
			ID:       uuid.NewString(),
			Type:     "tax",
			Name:     "Income Tax",
			Amount:   s.TaxDeduction,
			IsPreTax: false,
		})
	}

	if s.InsuranceDeduction > 0 {
		dto.Deductions = append(dto.Deductions, PayrollDeductionDTO{
			ID:       uuid.NewString(),
			Type:     "insurance",
			Name:     "Health Insurance",
			Amount:   s.InsuranceDeduction,
			IsPreTax: true,
		})
	}

	if s.LoanDeduction > 0 {
		dto.Deductions = append(dto.Deductions, PayrollDeductionDTO{
			ID:       uuid.NewString(),
			Type:     "loan",
			Name:     "Employee Loan",
			Amount:   s.LoanDeduction,
			IsPreTax: false,
		})
	}

	if s.OtherDeductions > 0 {
		dto.Deductions = append(dto.Deductions, PayrollDeductionDTO{
			ID:       uuid.NewString(),
			Type:     "other",
			Name:     "Other Deductions",
			Amount:   s.OtherDeductions,
			IsPreTax: false,
		})
	}

	return dto
}
