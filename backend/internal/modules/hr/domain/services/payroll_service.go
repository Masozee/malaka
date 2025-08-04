package services

import (
	"context"

	"malaka/internal/modules/hr/domain/entities"
)

// PayrollService defines the interface for payroll business logic
type PayrollService interface {
	// Payroll Period operations
	GetPayrollPeriods(ctx context.Context) ([]*entities.PayrollPeriod, error)
	GetPayrollPeriodByID(ctx context.Context, id string) (*entities.PayrollPeriod, error)
	CreatePayrollPeriod(ctx context.Context, period *entities.PayrollPeriod) error
	UpdatePayrollPeriod(ctx context.Context, period *entities.PayrollPeriod) error
	DeletePayrollPeriod(ctx context.Context, id string) error
	
	// Salary Calculation operations
	GetSalaryCalculations(ctx context.Context) ([]*entities.SalaryCalculation, error)
	GetSalaryCalculationsByPeriod(ctx context.Context, year, month int) ([]*entities.SalaryCalculation, error)
	GetSalaryCalculationByID(ctx context.Context, id string) (*entities.SalaryCalculation, error)
	CreateSalaryCalculation(ctx context.Context, calculation *entities.SalaryCalculation) error
	UpdateSalaryCalculation(ctx context.Context, calculation *entities.SalaryCalculation) error
	DeleteSalaryCalculation(ctx context.Context, id string) error
	
	// Payroll processing
	ProcessPayroll(ctx context.Context, year, month int) error
	ApprovePayroll(ctx context.Context, periodID string) error
	
	// Frontend DTO operations
	GetPayrollItemsDTO(ctx context.Context, year, month int) ([]*entities.PayrollItemDTO, error)
}