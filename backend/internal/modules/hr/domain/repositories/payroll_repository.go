package repositories

import (
	"context"

	"malaka/internal/modules/hr/domain/entities"
)

// PayrollPeriodRepository defines the interface for payroll period data access
type PayrollPeriodRepository interface {
	Create(ctx context.Context, period *entities.PayrollPeriod) error
	GetByID(ctx context.Context, id string) (*entities.PayrollPeriod, error)
	GetAll(ctx context.Context) ([]*entities.PayrollPeriod, error)
	GetByYearMonth(ctx context.Context, year, month int) (*entities.PayrollPeriod, error)
	Update(ctx context.Context, period *entities.PayrollPeriod) error
	Delete(ctx context.Context, id string) error
}

// SalaryCalculationRepository defines the interface for salary calculation data access
type SalaryCalculationRepository interface {
	Create(ctx context.Context, calculation *entities.SalaryCalculation) error
	GetByID(ctx context.Context, id string) (*entities.SalaryCalculation, error)
	GetAll(ctx context.Context) ([]*entities.SalaryCalculation, error)
	GetByEmployee(ctx context.Context, employeeID string) ([]*entities.SalaryCalculation, error)
	GetByPeriod(ctx context.Context, year, month int) ([]*entities.SalaryCalculation, error)
	GetByEmployeeAndPeriod(ctx context.Context, employeeID string, year, month int) (*entities.SalaryCalculation, error)
	Update(ctx context.Context, calculation *entities.SalaryCalculation) error
	Delete(ctx context.Context, id string) error
}