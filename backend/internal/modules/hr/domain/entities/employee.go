package entities

import (
	"time"

	"github.com/google/uuid"
)

// Employee represents an employee entity.
type Employee struct {
	ID        uuid.UUID `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	EmployeeCode     string     `json:"employee_code" db:"employee_code"`
	EmployeeName     string     `json:"employee_name" db:"employee_name"`
	Position         string     `json:"position" db:"position"`
	Department       string     `json:"department" db:"department"`
	HireDate         time.Time  `json:"hire_date" db:"hire_date"`
	BirthDate        *time.Time `json:"birth_date" db:"birth_date"`
	Gender           string     `json:"gender" db:"gender"`
	MaritalStatus    string     `json:"marital_status" db:"marital_status"`
	Address          string     `json:"address" db:"address"`
	Phone            string     `json:"phone" db:"phone"`
	Email            string     `json:"email" db:"email"`
	IDNumber         string     `json:"id_number" db:"id_number"`
	TaxID            string     `json:"tax_id" db:"tax_id"`
	BankAccount      string     `json:"bank_account" db:"bank_account"`
	BankName         string     `json:"bank_name" db:"bank_name"`
	BasicSalary      float64    `json:"basic_salary" db:"basic_salary"`
	Allowances       float64    `json:"allowances" db:"allowances"`
	EmploymentStatus string     `json:"employment_status" db:"employment_status"`
	SupervisorID     *string    `json:"supervisor_id" db:"supervisor_id"`
}

// TableName returns the table name for the Employee entity.
func (Employee) TableName() string {
	return "employees"
}