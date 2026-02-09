package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/domain/repositories"
	"malaka/internal/shared/uuid"
)

// PostgreSQLEmployeeRepository implements repositories.EmployeeRepository for PostgreSQL.
type PostgreSQLEmployeeRepository struct {
	db *sqlx.DB
}

// NewPostgreSQLEmployeeRepository creates a new PostgreSQLEmployeeRepository.
func NewPostgreSQLEmployeeRepository(db *sqlx.DB) repositories.EmployeeRepository {
	return &PostgreSQLEmployeeRepository{db: db}
}

// Create creates a new employee in the database.
func (r *PostgreSQLEmployeeRepository) Create(ctx context.Context, employee *entities.Employee) error {
	query := `INSERT INTO employees (id, employee_code, employee_name, position, department, hire_date, birth_date, gender, marital_status, address, phone, email, id_number, tax_id, bank_account, bank_name, basic_salary, allowances, employment_status, supervisor_id, user_id, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`
	_, err := r.db.ExecContext(ctx, query, employee.ID, employee.EmployeeCode, employee.EmployeeName, employee.Position, employee.Department, employee.HireDate, employee.BirthDate, employee.Gender, employee.MaritalStatus, employee.Address, employee.Phone, employee.Email, employee.IDNumber, employee.TaxID, employee.BankAccount, employee.BankName, employee.BasicSalary, employee.Allowances, employee.EmploymentStatus, employee.SupervisorID, employee.UserID, employee.CreatedAt, employee.UpdatedAt)
	return err
}

// GetByID retrieves an employee by its ID from the database.
func (r *PostgreSQLEmployeeRepository) GetByID(ctx context.Context, id uuid.ID) (*entities.Employee, error) {
	employee := &entities.Employee{}
	query := `SELECT id, employee_code, employee_name, position, department, hire_date, birth_date, gender, marital_status, address, phone, email, id_number, tax_id, bank_account, bank_name, basic_salary, allowances, employment_status, supervisor_id, user_id, created_at, updated_at FROM employees WHERE id = $1`
	err := r.db.GetContext(ctx, employee, query, id)
	if err == sql.ErrNoRows {
		return nil, nil // Employee not found
	}
	return employee, err
}

// GetAll retrieves all employees from the database with pagination.
func (r *PostgreSQLEmployeeRepository) GetAll(ctx context.Context, limit, offset int) ([]*entities.Employee, error) {
	employees := []*entities.Employee{}
	query := `SELECT id, employee_code, employee_name, position, department, hire_date, birth_date, gender, marital_status, address, phone, email, id_number, tax_id, bank_account, bank_name, basic_salary, allowances, employment_status, supervisor_id, user_id, created_at, updated_at FROM employees ORDER BY created_at DESC LIMIT $1 OFFSET $2`
	err := r.db.SelectContext(ctx, &employees, query, limit, offset)
	return employees, err
}

// Update updates an existing employee in the database.
func (r *PostgreSQLEmployeeRepository) Update(ctx context.Context, employee *entities.Employee) error {
	query := `UPDATE employees SET employee_code = $1, employee_name = $2, position = $3, department = $4, hire_date = $5, birth_date = $6, gender = $7, marital_status = $8, address = $9, phone = $10, email = $11, id_number = $12, tax_id = $13, bank_account = $14, bank_name = $15, basic_salary = $16, allowances = $17, employment_status = $18, supervisor_id = $19, user_id = $20, updated_at = $21 WHERE id = $22`
	_, err := r.db.ExecContext(ctx, query, employee.EmployeeCode, employee.EmployeeName, employee.Position, employee.Department, employee.HireDate, employee.BirthDate, employee.Gender, employee.MaritalStatus, employee.Address, employee.Phone, employee.Email, employee.IDNumber, employee.TaxID, employee.BankAccount, employee.BankName, employee.BasicSalary, employee.Allowances, employee.EmploymentStatus, employee.SupervisorID, employee.UserID, employee.UpdatedAt, employee.ID)
	return err
}

// Delete deletes an employee by its ID from the database.
func (r *PostgreSQLEmployeeRepository) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM employees WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetByUserID retrieves an employee by their linked user ID.
func (r *PostgreSQLEmployeeRepository) GetByUserID(ctx context.Context, userID string) (*entities.Employee, error) {
	employee := &entities.Employee{}
	query := `SELECT id, employee_code, employee_name, position, department, hire_date, birth_date, gender, marital_status, address, phone, email, id_number, tax_id, bank_account, bank_name, basic_salary, allowances, employment_status, supervisor_id, user_id, created_at, updated_at FROM employees WHERE user_id = $1`
	err := r.db.GetContext(ctx, employee, query, userID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return employee, err
}
