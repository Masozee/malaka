package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// PayrollPeriod represents a payroll period in the system
type PayrollPeriod struct {
	ID               uuid.ID    `json:"id" db:"id"`
	PeriodYear       int        `json:"period_year" db:"period_year"`
	PeriodMonth      int        `json:"period_month" db:"period_month"`
	TotalEmployees   int        `json:"total_employees" db:"total_employees"`
	TotalGrossSalary float64    `json:"total_gross_salary" db:"total_gross_salary"`
	TotalNetSalary   float64    `json:"total_net_salary" db:"total_net_salary"`
	TotalDeductions  float64    `json:"total_deductions" db:"total_deductions"`
	PostingDate      time.Time  `json:"posting_date" db:"posting_date"`
	JournalNumber    *string    `json:"journal_number" db:"journal_number"`
	PostedBy         uuid.ID    `json:"posted_by" db:"posted_by"`
	ApprovedBy       *uuid.ID   `json:"approved_by" db:"approved_by"`
	ApprovedAt       *time.Time `json:"approved_at" db:"approved_at"`
	Status           string     `json:"status" db:"status"`
	CreatedAt        time.Time  `json:"created_at" db:"created_at"`
}

// PayrollPeriodStatus constants
const (
	PayrollStatusDraft      = "DRAFT"
	PayrollStatusProcessing = "PROCESSING"
	PayrollStatusPosted     = "POSTED"
	PayrollStatusApproved   = "APPROVED"
	PayrollStatusLocked     = "LOCKED"
)

// TableName returns the table name for the entity
func (PayrollPeriod) TableName() string {
	return "salary_posting"
}

// StartDate calculates the start date for the payroll period
func (p *PayrollPeriod) StartDate() time.Time {
	return time.Date(p.PeriodYear, time.Month(p.PeriodMonth), 1, 0, 0, 0, 0, time.UTC)
}

// EndDate calculates the end date for the payroll period
func (p *PayrollPeriod) EndDate() time.Time {
	start := p.StartDate()
	return start.AddDate(0, 1, -1) // Last day of the month
}

// IsProcessable checks if the payroll period can be processed
func (p *PayrollPeriod) IsProcessable() bool {
	return p.Status == PayrollStatusDraft || p.Status == PayrollStatusProcessing
}

// IsModifiable checks if the payroll period can be modified
func (p *PayrollPeriod) IsModifiable() bool {
	return p.Status == PayrollStatusDraft
}

// CanBeApproved checks if the payroll period can be approved
func (p *PayrollPeriod) CanBeApproved() bool {
	return p.Status == PayrollStatusPosted
}

// CanBeLocked checks if the payroll period can be locked
func (p *PayrollPeriod) CanBeLocked() bool {
	return p.Status == PayrollStatusApproved
}

// FormatPeriod returns a formatted string representation of the period
func (p *PayrollPeriod) FormatPeriod() string {
	months := []string{
		"", "January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December",
	}

	if p.PeriodMonth >= 1 && p.PeriodMonth <= 12 {
		return months[p.PeriodMonth] + " " + string(rune(p.PeriodYear))
	}
	return "Invalid Period"
}
