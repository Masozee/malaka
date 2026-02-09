package dto

import (
	"time"

	"malaka/internal/modules/hr/domain/entities"
)

// EmployeeCreateRequest represents the request to create a new employee.
type EmployeeCreateRequest struct {
	EmployeeCode     string  `json:"employee_code" binding:"required"`
	EmployeeName     string  `json:"employee_name" binding:"required"`
	Position         string  `json:"position" binding:"required"`
	Department       string  `json:"department" binding:"required"`
	HireDate         string  `json:"hire_date" binding:"required"`
	BirthDate        *string `json:"birth_date"`
	Gender           string  `json:"gender" binding:"required,oneof=M F"`
	MaritalStatus    string  `json:"marital_status" binding:"required,oneof=Single Married Divorced Widowed"`
	Address          string  `json:"address"`
	Phone            string  `json:"phone"`
	Email            string  `json:"email" binding:"required,email"`
	IDNumber         string  `json:"id_number"`
	TaxID            string  `json:"tax_id"`
	BankAccount      string  `json:"bank_account"`
	BankName         string  `json:"bank_name"`
	BasicSalary      float64 `json:"basic_salary" binding:"required,gte=0"`
	Allowances       float64 `json:"allowances" binding:"gte=0"`
	EmploymentStatus string  `json:"employment_status" binding:"required,oneof=ACTIVE INACTIVE TERMINATED"`
	SupervisorID     *string `json:"supervisor_id"`
	UserID           *string `json:"user_id"`
}

// ToEmployeeEntity converts EmployeeCreateRequest to entities.Employee.
func (req *EmployeeCreateRequest) ToEmployeeEntity() (*entities.Employee, error) {
	hireDate, err := time.Parse("2006-01-02", req.HireDate)
	if err != nil {
		return nil, err
	}

	var birthDate *time.Time
	if req.BirthDate != nil && *req.BirthDate != "" {
		bd, err := time.Parse("2006-01-02", *req.BirthDate)
		if err != nil {
			return nil, err
		}
		birthDate = &bd
	}

	return &entities.Employee{
		EmployeeCode:     req.EmployeeCode,
		EmployeeName:     req.EmployeeName,
		Position:         req.Position,
		Department:       req.Department,
		HireDate:         hireDate,
		BirthDate:        birthDate,
		Gender:           req.Gender,
		MaritalStatus:    req.MaritalStatus,
		Address:          req.Address,
		Phone:            req.Phone,
		Email:            req.Email,
		IDNumber:         req.IDNumber,
		TaxID:            req.TaxID,
		BankAccount:      req.BankAccount,
		BankName:         req.BankName,
		BasicSalary:      req.BasicSalary,
		Allowances:       req.Allowances,
		EmploymentStatus: req.EmploymentStatus,
		SupervisorID:     req.SupervisorID,
		UserID:           req.UserID,
	}, nil
}

// EmployeeUpdateRequest represents the request to update an existing employee.
type EmployeeUpdateRequest struct {
	EmployeeCode     *string `json:"employee_code"`
	EmployeeName     *string `json:"employee_name"`
	Position         *string `json:"position"`
	Department       *string `json:"department"`
	HireDate         *string `json:"hire_date"`
	BirthDate        *string `json:"birth_date"`
	Gender           *string `json:"gender" binding:"omitempty,oneof=M F"`
	MaritalStatus    *string `json:"marital_status" binding:"omitempty,oneof=Single Married Divorced Widowed"`
	Address          *string `json:"address"`
	Phone            *string `json:"phone"`
	Email            *string `json:"email" binding:"omitempty,email"`
	IDNumber         *string `json:"id_number"`
	TaxID            *string `json:"tax_id"`
	BankAccount      *string `json:"bank_account"`
	BankName         *string `json:"bank_name"`
	BasicSalary      *float64 `json:"basic_salary" binding:"omitempty,gte=0"`
	Allowances       *float64 `json:"allowances" binding:"omitempty,gte=0"`
	EmploymentStatus *string `json:"employment_status" binding:"omitempty,oneof=ACTIVE INACTIVE TERMINATED"`
	SupervisorID     *string `json:"supervisor_id"`
	UserID           *string `json:"user_id"`
}

// ToEmployeeEntity converts EmployeeUpdateRequest to entities.Employee.
func (req *EmployeeUpdateRequest) ToEmployeeEntity(existing *entities.Employee) (*entities.Employee, error) {
	if req.EmployeeCode != nil {
		existing.EmployeeCode = *req.EmployeeCode
	}
	if req.EmployeeName != nil {
		existing.EmployeeName = *req.EmployeeName
	}
	if req.Position != nil {
		existing.Position = *req.Position
	}
	if req.Department != nil {
		existing.Department = *req.Department
	}
	if req.HireDate != nil {
		hireDate, err := time.Parse("2006-01-02", *req.HireDate)
		if err != nil {
			return nil, err
		}
		existing.HireDate = hireDate
	}
	if req.BirthDate != nil {
		if *req.BirthDate == "" {
			existing.BirthDate = nil
		} else {
			birthDate, err := time.Parse("2006-01-02", *req.BirthDate)
			if err != nil {
				return nil, err
			}
			existing.BirthDate = &birthDate
		}
	}
	if req.Gender != nil {
		existing.Gender = *req.Gender
	}
	if req.MaritalStatus != nil {
		existing.MaritalStatus = *req.MaritalStatus
	}
	if req.Address != nil {
		existing.Address = *req.Address
	}
	if req.Phone != nil {
		existing.Phone = *req.Phone
	}
	if req.Email != nil {
		existing.Email = *req.Email
	}
	if req.IDNumber != nil {
		existing.IDNumber = *req.IDNumber
	}
	if req.TaxID != nil {
		existing.TaxID = *req.TaxID
	}
	if req.BankAccount != nil {
		existing.BankAccount = *req.BankAccount
	}
	if req.BankName != nil {
		existing.BankName = *req.BankName
	}
	if req.BasicSalary != nil {
		existing.BasicSalary = *req.BasicSalary
	}
	if req.Allowances != nil {
		existing.Allowances = *req.Allowances
	}
	if req.EmploymentStatus != nil {
		existing.EmploymentStatus = *req.EmploymentStatus
	}
	if req.SupervisorID != nil {
		existing.SupervisorID = req.SupervisorID
	}
	if req.UserID != nil {
		if *req.UserID != "" {
			existing.UserID = req.UserID
		} else {
			existing.UserID = nil
		}
	}
	return existing, nil
}

// EmployeeResponse represents the response for an employee.
type EmployeeResponse struct {
	ID               string     `json:"id"`
	EmployeeCode     string     `json:"employee_code"`
	EmployeeName     string     `json:"employee_name"`
	Position         string     `json:"position"`
	Department       string     `json:"department"`
	HireDate         time.Time  `json:"hire_date"`
	BirthDate        *time.Time `json:"birth_date"`
	Gender           string     `json:"gender"`
	MaritalStatus    string     `json:"marital_status"`
	Address          string     `json:"address"`
	Phone            string     `json:"phone"`
	Email            string     `json:"email"`
	IDNumber         string     `json:"id_number"`
	TaxID            string     `json:"tax_id"`
	BankAccount      string     `json:"bank_account"`
	BankName         string     `json:"bank_name"`
	BasicSalary      float64    `json:"basic_salary"`
	Allowances       float64    `json:"allowances"`
	TotalSalary      float64    `json:"total_salary"`
	EmploymentStatus string     `json:"employment_status"`
	SupervisorID     *string    `json:"supervisor_id"`
	UserID           *string    `json:"user_id,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

// FromEmployeeEntity converts entities.Employee to EmployeeResponse.
func FromEmployeeEntity(employee *entities.Employee) *EmployeeResponse {
	return &EmployeeResponse{
		ID:               employee.ID.String(),
		EmployeeCode:     employee.EmployeeCode,
		EmployeeName:     employee.EmployeeName,
		Position:         employee.Position,
		Department:       employee.Department,
		HireDate:         employee.HireDate,
		BirthDate:        employee.BirthDate,
		Gender:           employee.Gender,
		MaritalStatus:    employee.MaritalStatus,
		Address:          employee.Address,
		Phone:            employee.Phone,
		Email:            employee.Email,
		IDNumber:         employee.IDNumber,
		TaxID:            employee.TaxID,
		BankAccount:      employee.BankAccount,
		BankName:         employee.BankName,
		BasicSalary:      employee.BasicSalary,
		Allowances:       employee.Allowances,
		TotalSalary:      employee.BasicSalary + employee.Allowances,
		EmploymentStatus: employee.EmploymentStatus,
		SupervisorID:     employee.SupervisorID,
		UserID:           employee.UserID,
		CreatedAt:        employee.CreatedAt,
		UpdatedAt:        employee.UpdatedAt,
	}
}
