package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/domain/repositories"
)

// PayrollServiceImpl implements the PayrollService interface
type PayrollServiceImpl struct {
	payrollPeriodRepo     repositories.PayrollPeriodRepository
	salaryCalculationRepo repositories.SalaryCalculationRepository
	employeeRepo          repositories.EmployeeRepository
}

// NewPayrollService creates a new instance of PayrollService
func NewPayrollService(
	payrollPeriodRepo repositories.PayrollPeriodRepository,
	salaryCalculationRepo repositories.SalaryCalculationRepository,
	employeeRepo repositories.EmployeeRepository,
) PayrollService {
	return &PayrollServiceImpl{
		payrollPeriodRepo:     payrollPeriodRepo,
		salaryCalculationRepo: salaryCalculationRepo,
		employeeRepo:          employeeRepo,
	}
}

// Payroll Period operations
func (s *PayrollServiceImpl) GetPayrollPeriods(ctx context.Context) ([]*entities.PayrollPeriod, error) {
	return s.payrollPeriodRepo.GetAll(ctx)
}

func (s *PayrollServiceImpl) GetPayrollPeriodByID(ctx context.Context, id string) (*entities.PayrollPeriod, error) {
	return s.payrollPeriodRepo.GetByID(ctx, id)
}

func (s *PayrollServiceImpl) CreatePayrollPeriod(ctx context.Context, period *entities.PayrollPeriod) error {
	// Validate that period doesn't already exist
	existingPeriod, err := s.payrollPeriodRepo.GetByYearMonth(ctx, period.PeriodYear, period.PeriodMonth)
	if err == nil && existingPeriod != nil {
		return fmt.Errorf("payroll period for %d-%02d already exists", period.PeriodYear, period.PeriodMonth)
	}

	// Set defaults
	if period.ID == uuid.Nil {
		period.ID = uuid.New()
	}
	if period.Status == "" {
		period.Status = entities.PayrollStatusDraft
	}
	if period.CreatedAt.IsZero() {
		period.CreatedAt = time.Now()
	}

	return s.payrollPeriodRepo.Create(ctx, period)
}

func (s *PayrollServiceImpl) UpdatePayrollPeriod(ctx context.Context, period *entities.PayrollPeriod) error {
	// Validate that period exists
	existing, err := s.payrollPeriodRepo.GetByID(ctx, period.ID.String())
	if err != nil {
		return fmt.Errorf("payroll period not found: %w", err)
	}

	// Check if period can be modified
	if !existing.IsModifiable() && period.Status != entities.PayrollStatusApproved && period.Status != entities.PayrollStatusLocked {
		return fmt.Errorf("payroll period cannot be modified in current status: %s", existing.Status)
	}

	return s.payrollPeriodRepo.Update(ctx, period)
}

func (s *PayrollServiceImpl) DeletePayrollPeriod(ctx context.Context, id string) error {
	// Validate that period exists and can be deleted
	existing, err := s.payrollPeriodRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("payroll period not found: %w", err)
	}

	if !existing.IsModifiable() {
		return fmt.Errorf("payroll period cannot be deleted in current status: %s", existing.Status)
	}

	return s.payrollPeriodRepo.Delete(ctx, id)
}

// Salary Calculation operations
func (s *PayrollServiceImpl) GetSalaryCalculations(ctx context.Context) ([]*entities.SalaryCalculation, error) {
	return s.salaryCalculationRepo.GetAll(ctx)
}

func (s *PayrollServiceImpl) GetSalaryCalculationsByPeriod(ctx context.Context, year, month int) ([]*entities.SalaryCalculation, error) {
	return s.salaryCalculationRepo.GetByPeriod(ctx, year, month)
}

func (s *PayrollServiceImpl) GetSalaryCalculationByID(ctx context.Context, id string) (*entities.SalaryCalculation, error) {
	return s.salaryCalculationRepo.GetByID(ctx, id)
}

func (s *PayrollServiceImpl) CreateSalaryCalculation(ctx context.Context, calculation *entities.SalaryCalculation) error {
	// Validate that calculation doesn't already exist for this employee and period
	existing, err := s.salaryCalculationRepo.GetByEmployeeAndPeriod(ctx, 
		calculation.EmployeeID.String(), calculation.PeriodYear, calculation.PeriodMonth)
	if err == nil && existing != nil {
		return fmt.Errorf("salary calculation for employee %s in period %d-%02d already exists", 
			calculation.EmployeeID.String(), calculation.PeriodYear, calculation.PeriodMonth)
	}

	// Set defaults
	if calculation.ID == uuid.Nil {
		calculation.ID = uuid.New()
	}
	if calculation.Status == "" {
		calculation.Status = entities.SalaryStatusDraft
	}
	if calculation.CreatedAt.IsZero() {
		calculation.CreatedAt = time.Now()
	}

	// Perform calculations
	calculation.CalculateAll()

	return s.salaryCalculationRepo.Create(ctx, calculation)
}

func (s *PayrollServiceImpl) UpdateSalaryCalculation(ctx context.Context, calculation *entities.SalaryCalculation) error {
	// Validate that calculation exists
	existing, err := s.salaryCalculationRepo.GetByID(ctx, calculation.ID.String())
	if err != nil {
		return fmt.Errorf("salary calculation not found: %w", err)
	}

	// Check if calculation can be modified
	if !existing.IsEditable() {
		return fmt.Errorf("salary calculation cannot be modified in current status: %s", existing.Status)
	}

	// Perform calculations
	calculation.CalculateAll()

	return s.salaryCalculationRepo.Update(ctx, calculation)
}

func (s *PayrollServiceImpl) DeleteSalaryCalculation(ctx context.Context, id string) error {
	// Validate that calculation exists and can be deleted
	existing, err := s.salaryCalculationRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("salary calculation not found: %w", err)
	}

	if !existing.IsEditable() {
		return fmt.Errorf("salary calculation cannot be deleted in current status: %s", existing.Status)
	}

	return s.salaryCalculationRepo.Delete(ctx, id)
}

// Payroll processing
func (s *PayrollServiceImpl) ProcessPayroll(ctx context.Context, year, month int) error {
	// Check if payroll period exists
	period, err := s.payrollPeriodRepo.GetByYearMonth(ctx, year, month)
	if err != nil {
		return fmt.Errorf("payroll period not found for %d-%02d: %w", year, month, err)
	}

	if !period.IsProcessable() {
		return fmt.Errorf("payroll period cannot be processed in current status: %s", period.Status)
	}

	// Get all salary calculations for the period
	calculations, err := s.salaryCalculationRepo.GetByPeriod(ctx, year, month)
	if err != nil {
		return fmt.Errorf("failed to get salary calculations: %w", err)
	}

	if len(calculations) == 0 {
		return fmt.Errorf("no salary calculations found for period %d-%02d", year, month)
	}

	// Update all calculations to processed status
	for _, calc := range calculations {
		if calc.Status == entities.SalaryStatusDraft {
			calc.Status = entities.SalaryStatusCalculated
			calc.CalculatedAt = &time.Time{}
			*calc.CalculatedAt = time.Now()
			
			err = s.salaryCalculationRepo.Update(ctx, calc)
			if err != nil {
				return fmt.Errorf("failed to update salary calculation %s: %w", calc.ID.String(), err)
			}
		}
	}

	// Update period status
	period.Status = entities.PayrollStatusProcessing
	period.PostingDate = time.Now()

	// Recalculate totals
	var totalGross, totalNet, totalDeductions float64
	for _, calc := range calculations {
		totalGross += calc.GrossSalary
		totalNet += calc.NetSalary
		totalDeductions += calc.TotalDeductions
	}

	period.TotalEmployees = len(calculations)
	period.TotalGrossSalary = totalGross
	period.TotalNetSalary = totalNet
	period.TotalDeductions = totalDeductions

	return s.payrollPeriodRepo.Update(ctx, period)
}

func (s *PayrollServiceImpl) ApprovePayroll(ctx context.Context, periodID string) error {
	// Get the payroll period
	period, err := s.payrollPeriodRepo.GetByID(ctx, periodID)
	if err != nil {
		return fmt.Errorf("payroll period not found: %w", err)
	}

	if !period.CanBeApproved() {
		return fmt.Errorf("payroll period cannot be approved in current status: %s", period.Status)
	}

	// Update period status
	period.Status = entities.PayrollStatusApproved
	now := time.Now()
	period.ApprovedAt = &now

	// Update all salary calculations to approved status
	calculations, err := s.salaryCalculationRepo.GetByPeriod(ctx, period.PeriodYear, period.PeriodMonth)
	if err != nil {
		return fmt.Errorf("failed to get salary calculations: %w", err)
	}

	for _, calc := range calculations {
		if calc.Status == entities.SalaryStatusCalculated {
			calc.Status = entities.SalaryStatusApproved
			err = s.salaryCalculationRepo.Update(ctx, calc)
			if err != nil {
				return fmt.Errorf("failed to update salary calculation %s: %w", calc.ID.String(), err)
			}
		}
	}

	return s.payrollPeriodRepo.Update(ctx, period)
}

// Frontend DTO operations
func (s *PayrollServiceImpl) GetPayrollItemsDTO(ctx context.Context, year, month int) ([]*entities.PayrollItemDTO, error) {
	calculations, err := s.salaryCalculationRepo.GetByPeriod(ctx, year, month)
	if err != nil {
		return nil, err
	}

	var payrollItems []*entities.PayrollItemDTO
	for _, calc := range calculations {
		dto := calc.ToPayrollItemDTO()
		// Set period ID if we have it
		if period, err := s.payrollPeriodRepo.GetByYearMonth(ctx, year, month); err == nil && period != nil {
			dto.PayrollPeriodID = period.ID.String()
		}
		payrollItems = append(payrollItems, dto)
	}

	return payrollItems, nil
}