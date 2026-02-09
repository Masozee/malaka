package persistence

import (
	"context"
	"database/sql"

	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/domain/repositories"
	"malaka/internal/shared/uuid"
)

// PostgreSQLPayrollPeriodRepository implements the PayrollPeriodRepository interface
type PostgreSQLPayrollPeriodRepository struct {
	db *sql.DB
}

// NewPostgreSQLPayrollPeriodRepository creates a new instance of the repository
func NewPostgreSQLPayrollPeriodRepository(db *sql.DB) repositories.PayrollPeriodRepository {
	return &PostgreSQLPayrollPeriodRepository{db: db}
}

func (r *PostgreSQLPayrollPeriodRepository) Create(ctx context.Context, period *entities.PayrollPeriod) error {
	query := `
		INSERT INTO salary_posting (id, period_year, period_month, total_employees,
			total_gross_salary, total_net_salary, total_deductions, posting_date,
			journal_number, posted_by, approved_by, approved_at, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`

	if period.ID.IsNil() {
		period.ID = uuid.New()
	}

	_, err := r.db.ExecContext(ctx, query,
		period.ID, period.PeriodYear, period.PeriodMonth, period.TotalEmployees,
		period.TotalGrossSalary, period.TotalNetSalary, period.TotalDeductions,
		period.PostingDate, period.JournalNumber, period.PostedBy,
		period.ApprovedBy, period.ApprovedAt, period.Status, period.CreatedAt)

	return err
}

func (r *PostgreSQLPayrollPeriodRepository) GetByID(ctx context.Context, id uuid.ID) (*entities.PayrollPeriod, error) {
	query := `
		SELECT id, period_year, period_month, total_employees, total_gross_salary,
			total_net_salary, total_deductions, posting_date, journal_number,
			posted_by, approved_by, approved_at, status, created_at
		FROM salary_posting WHERE id = $1`

	period := &entities.PayrollPeriod{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&period.ID, &period.PeriodYear, &period.PeriodMonth, &period.TotalEmployees,
		&period.TotalGrossSalary, &period.TotalNetSalary, &period.TotalDeductions,
		&period.PostingDate, &period.JournalNumber, &period.PostedBy,
		&period.ApprovedBy, &period.ApprovedAt, &period.Status, &period.CreatedAt)

	if err != nil {
		return nil, err
	}

	return period, nil
}

func (r *PostgreSQLPayrollPeriodRepository) GetAll(ctx context.Context) ([]*entities.PayrollPeriod, error) {
	query := `
		SELECT id, period_year, period_month, total_employees, total_gross_salary,
			total_net_salary, total_deductions, posting_date, journal_number,
			posted_by, approved_by, approved_at, status, created_at
		FROM salary_posting
		ORDER BY period_year DESC, period_month DESC`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var periods []*entities.PayrollPeriod
	for rows.Next() {
		period := &entities.PayrollPeriod{}
		err := rows.Scan(
			&period.ID, &period.PeriodYear, &period.PeriodMonth, &period.TotalEmployees,
			&period.TotalGrossSalary, &period.TotalNetSalary, &period.TotalDeductions,
			&period.PostingDate, &period.JournalNumber, &period.PostedBy,
			&period.ApprovedBy, &period.ApprovedAt, &period.Status, &period.CreatedAt)
		if err != nil {
			return nil, err
		}
		periods = append(periods, period)
	}

	return periods, nil
}

func (r *PostgreSQLPayrollPeriodRepository) GetByYearMonth(ctx context.Context, year, month int) (*entities.PayrollPeriod, error) {
	query := `
		SELECT id, period_year, period_month, total_employees, total_gross_salary,
			total_net_salary, total_deductions, posting_date, journal_number,
			posted_by, approved_by, approved_at, status, created_at
		FROM salary_posting WHERE period_year = $1 AND period_month = $2`

	period := &entities.PayrollPeriod{}
	err := r.db.QueryRowContext(ctx, query, year, month).Scan(
		&period.ID, &period.PeriodYear, &period.PeriodMonth, &period.TotalEmployees,
		&period.TotalGrossSalary, &period.TotalNetSalary, &period.TotalDeductions,
		&period.PostingDate, &period.JournalNumber, &period.PostedBy,
		&period.ApprovedBy, &period.ApprovedAt, &period.Status, &period.CreatedAt)

	if err != nil {
		return nil, err
	}

	return period, nil
}

func (r *PostgreSQLPayrollPeriodRepository) Update(ctx context.Context, period *entities.PayrollPeriod) error {
	query := `
		UPDATE salary_posting SET
			total_employees = $2, total_gross_salary = $3, total_net_salary = $4,
			total_deductions = $5, posting_date = $6, journal_number = $7,
			approved_by = $8, approved_at = $9, status = $10
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		period.ID, period.TotalEmployees, period.TotalGrossSalary, period.TotalNetSalary,
		period.TotalDeductions, period.PostingDate, period.JournalNumber,
		period.ApprovedBy, period.ApprovedAt, period.Status)

	return err
}

func (r *PostgreSQLPayrollPeriodRepository) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM salary_posting WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// PostgreSQLSalaryCalculationRepository implements the SalaryCalculationRepository interface
type PostgreSQLSalaryCalculationRepository struct {
	db *sql.DB
}

// NewPostgreSQLSalaryCalculationRepository creates a new instance of the repository
func NewPostgreSQLSalaryCalculationRepository(db *sql.DB) repositories.SalaryCalculationRepository {
	return &PostgreSQLSalaryCalculationRepository{db: db}
}

func (r *PostgreSQLSalaryCalculationRepository) Create(ctx context.Context, calculation *entities.SalaryCalculation) error {
	query := `
		INSERT INTO salary_calculation (id, employee_id, period_year, period_month,
			basic_salary, allowances, overtime_amount, commission_amount, bonus_amount,
			gross_salary, tax_deduction, insurance_deduction, loan_deduction,
			other_deductions, total_deductions, net_salary, status, calculated_by,
			calculated_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`

	if calculation.ID.IsNil() {
		calculation.ID = uuid.New()
	}

	_, err := r.db.ExecContext(ctx, query,
		calculation.ID, calculation.EmployeeID, calculation.PeriodYear, calculation.PeriodMonth,
		calculation.BasicSalary, calculation.Allowances, calculation.OvertimeAmount,
		calculation.CommissionAmount, calculation.BonusAmount, calculation.GrossSalary,
		calculation.TaxDeduction, calculation.InsuranceDeduction, calculation.LoanDeduction,
		calculation.OtherDeductions, calculation.TotalDeductions, calculation.NetSalary,
		calculation.Status, calculation.CalculatedBy, calculation.CalculatedAt, calculation.CreatedAt)

	return err
}

func (r *PostgreSQLSalaryCalculationRepository) GetByID(ctx context.Context, id uuid.ID) (*entities.SalaryCalculation, error) {
	query := `
		SELECT sc.id, sc.employee_id, sc.period_year, sc.period_month,
			sc.basic_salary, sc.allowances, sc.overtime_amount, sc.commission_amount,
			sc.bonus_amount, sc.gross_salary, sc.tax_deduction, sc.insurance_deduction,
			sc.loan_deduction, sc.other_deductions, sc.total_deductions, sc.net_salary,
			sc.status, sc.calculated_by, sc.calculated_at, sc.created_at,
			e.id, e.employee_code, e.employee_name, e.position, e.department
		FROM salary_calculation sc
		LEFT JOIN employees e ON sc.employee_id = e.id
		WHERE sc.id = $1`

	calculation := &entities.SalaryCalculation{}
	employee := &entities.Employee{}

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&calculation.ID, &calculation.EmployeeID, &calculation.PeriodYear, &calculation.PeriodMonth,
		&calculation.BasicSalary, &calculation.Allowances, &calculation.OvertimeAmount,
		&calculation.CommissionAmount, &calculation.BonusAmount, &calculation.GrossSalary,
		&calculation.TaxDeduction, &calculation.InsuranceDeduction, &calculation.LoanDeduction,
		&calculation.OtherDeductions, &calculation.TotalDeductions, &calculation.NetSalary,
		&calculation.Status, &calculation.CalculatedBy, &calculation.CalculatedAt, &calculation.CreatedAt,
		&employee.ID, &employee.EmployeeCode, &employee.EmployeeName, &employee.Position, &employee.Department)

	if err != nil {
		return nil, err
	}

	calculation.Employee = employee
	return calculation, nil
}

func (r *PostgreSQLSalaryCalculationRepository) GetAll(ctx context.Context) ([]*entities.SalaryCalculation, error) {
	query := `
		SELECT sc.id, sc.employee_id, sc.period_year, sc.period_month,
			sc.basic_salary, sc.allowances, sc.overtime_amount, sc.commission_amount,
			sc.bonus_amount, sc.gross_salary, sc.tax_deduction, sc.insurance_deduction,
			sc.loan_deduction, sc.other_deductions, sc.total_deductions, sc.net_salary,
			sc.status, sc.calculated_by, sc.calculated_at, sc.created_at,
			e.id, e.employee_code, e.employee_name, e.position, e.department
		FROM salary_calculation sc
		LEFT JOIN employees e ON sc.employee_id = e.id
		ORDER BY sc.period_year DESC, sc.period_month DESC, e.employee_name ASC`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var calculations []*entities.SalaryCalculation
	for rows.Next() {
		calculation := &entities.SalaryCalculation{}
		employee := &entities.Employee{}

		err := rows.Scan(
			&calculation.ID, &calculation.EmployeeID, &calculation.PeriodYear, &calculation.PeriodMonth,
			&calculation.BasicSalary, &calculation.Allowances, &calculation.OvertimeAmount,
			&calculation.CommissionAmount, &calculation.BonusAmount, &calculation.GrossSalary,
			&calculation.TaxDeduction, &calculation.InsuranceDeduction, &calculation.LoanDeduction,
			&calculation.OtherDeductions, &calculation.TotalDeductions, &calculation.NetSalary,
			&calculation.Status, &calculation.CalculatedBy, &calculation.CalculatedAt, &calculation.CreatedAt,
			&employee.ID, &employee.EmployeeCode, &employee.EmployeeName, &employee.Position, &employee.Department)
		if err != nil {
			return nil, err
		}

		calculation.Employee = employee
		calculations = append(calculations, calculation)
	}

	return calculations, nil
}

func (r *PostgreSQLSalaryCalculationRepository) GetByEmployee(ctx context.Context, employeeID uuid.ID) ([]*entities.SalaryCalculation, error) {
	query := `
		SELECT sc.id, sc.employee_id, sc.period_year, sc.period_month,
			sc.basic_salary, sc.allowances, sc.overtime_amount, sc.commission_amount,
			sc.bonus_amount, sc.gross_salary, sc.tax_deduction, sc.insurance_deduction,
			sc.loan_deduction, sc.other_deductions, sc.total_deductions, sc.net_salary,
			sc.status, sc.calculated_by, sc.calculated_at, sc.created_at,
			e.id, e.employee_code, e.employee_name, e.position, e.department
		FROM salary_calculation sc
		LEFT JOIN employees e ON sc.employee_id = e.id
		WHERE sc.employee_id = $1
		ORDER BY sc.period_year DESC, sc.period_month DESC`

	rows, err := r.db.QueryContext(ctx, query, employeeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var calculations []*entities.SalaryCalculation
	for rows.Next() {
		calculation := &entities.SalaryCalculation{}
		employee := &entities.Employee{}

		err := rows.Scan(
			&calculation.ID, &calculation.EmployeeID, &calculation.PeriodYear, &calculation.PeriodMonth,
			&calculation.BasicSalary, &calculation.Allowances, &calculation.OvertimeAmount,
			&calculation.CommissionAmount, &calculation.BonusAmount, &calculation.GrossSalary,
			&calculation.TaxDeduction, &calculation.InsuranceDeduction, &calculation.LoanDeduction,
			&calculation.OtherDeductions, &calculation.TotalDeductions, &calculation.NetSalary,
			&calculation.Status, &calculation.CalculatedBy, &calculation.CalculatedAt, &calculation.CreatedAt,
			&employee.ID, &employee.EmployeeCode, &employee.EmployeeName, &employee.Position, &employee.Department)
		if err != nil {
			return nil, err
		}

		calculation.Employee = employee
		calculations = append(calculations, calculation)
	}

	return calculations, nil
}

func (r *PostgreSQLSalaryCalculationRepository) GetByPeriod(ctx context.Context, year, month int) ([]*entities.SalaryCalculation, error) {
	query := `
		SELECT sc.id, sc.employee_id, sc.period_year, sc.period_month,
			sc.basic_salary, sc.allowances, sc.overtime_amount, sc.commission_amount,
			sc.bonus_amount, sc.gross_salary, sc.tax_deduction, sc.insurance_deduction,
			sc.loan_deduction, sc.other_deductions, sc.total_deductions, sc.net_salary,
			sc.status, sc.calculated_by, sc.calculated_at, sc.created_at,
			e.id, e.employee_code, e.employee_name, e.position, e.department
		FROM salary_calculation sc
		LEFT JOIN employees e ON sc.employee_id = e.id
		WHERE sc.period_year = $1 AND sc.period_month = $2
		ORDER BY e.employee_name ASC`

	rows, err := r.db.QueryContext(ctx, query, year, month)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var calculations []*entities.SalaryCalculation
	for rows.Next() {
		calculation := &entities.SalaryCalculation{}
		employee := &entities.Employee{}

		err := rows.Scan(
			&calculation.ID, &calculation.EmployeeID, &calculation.PeriodYear, &calculation.PeriodMonth,
			&calculation.BasicSalary, &calculation.Allowances, &calculation.OvertimeAmount,
			&calculation.CommissionAmount, &calculation.BonusAmount, &calculation.GrossSalary,
			&calculation.TaxDeduction, &calculation.InsuranceDeduction, &calculation.LoanDeduction,
			&calculation.OtherDeductions, &calculation.TotalDeductions, &calculation.NetSalary,
			&calculation.Status, &calculation.CalculatedBy, &calculation.CalculatedAt, &calculation.CreatedAt,
			&employee.ID, &employee.EmployeeCode, &employee.EmployeeName, &employee.Position, &employee.Department)
		if err != nil {
			return nil, err
		}

		calculation.Employee = employee
		calculations = append(calculations, calculation)
	}

	return calculations, nil
}

func (r *PostgreSQLSalaryCalculationRepository) GetByEmployeeAndPeriod(ctx context.Context, employeeID uuid.ID, year, month int) (*entities.SalaryCalculation, error) {
	query := `
		SELECT sc.id, sc.employee_id, sc.period_year, sc.period_month,
			sc.basic_salary, sc.allowances, sc.overtime_amount, sc.commission_amount,
			sc.bonus_amount, sc.gross_salary, sc.tax_deduction, sc.insurance_deduction,
			sc.loan_deduction, sc.other_deductions, sc.total_deductions, sc.net_salary,
			sc.status, sc.calculated_by, sc.calculated_at, sc.created_at,
			e.id, e.employee_code, e.employee_name, e.position, e.department
		FROM salary_calculation sc
		LEFT JOIN employees e ON sc.employee_id = e.id
		WHERE sc.employee_id = $1 AND sc.period_year = $2 AND sc.period_month = $3`

	calculation := &entities.SalaryCalculation{}
	employee := &entities.Employee{}

	err := r.db.QueryRowContext(ctx, query, employeeID, year, month).Scan(
		&calculation.ID, &calculation.EmployeeID, &calculation.PeriodYear, &calculation.PeriodMonth,
		&calculation.BasicSalary, &calculation.Allowances, &calculation.OvertimeAmount,
		&calculation.CommissionAmount, &calculation.BonusAmount, &calculation.GrossSalary,
		&calculation.TaxDeduction, &calculation.InsuranceDeduction, &calculation.LoanDeduction,
		&calculation.OtherDeductions, &calculation.TotalDeductions, &calculation.NetSalary,
		&calculation.Status, &calculation.CalculatedBy, &calculation.CalculatedAt, &calculation.CreatedAt,
		&employee.ID, &employee.EmployeeCode, &employee.EmployeeName, &employee.Position, &employee.Department)

	if err != nil {
		return nil, err
	}

	calculation.Employee = employee
	return calculation, nil
}

func (r *PostgreSQLSalaryCalculationRepository) Update(ctx context.Context, calculation *entities.SalaryCalculation) error {
	query := `
		UPDATE salary_calculation SET
			basic_salary = $2, allowances = $3, overtime_amount = $4,
			commission_amount = $5, bonus_amount = $6, gross_salary = $7,
			tax_deduction = $8, insurance_deduction = $9, loan_deduction = $10,
			other_deductions = $11, total_deductions = $12, net_salary = $13,
			status = $14, calculated_by = $15, calculated_at = $16
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		calculation.ID, calculation.BasicSalary, calculation.Allowances, calculation.OvertimeAmount,
		calculation.CommissionAmount, calculation.BonusAmount, calculation.GrossSalary,
		calculation.TaxDeduction, calculation.InsuranceDeduction, calculation.LoanDeduction,
		calculation.OtherDeductions, calculation.TotalDeductions, calculation.NetSalary,
		calculation.Status, calculation.CalculatedBy, calculation.CalculatedAt)

	return err
}

func (r *PostgreSQLSalaryCalculationRepository) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM salary_calculation WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
