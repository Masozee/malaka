package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// FinancialPeriodStatus represents the status of a financial period
type FinancialPeriodStatus string

const (
	FinancialPeriodStatusOpen   FinancialPeriodStatus = "open"
	FinancialPeriodStatusClosed FinancialPeriodStatus = "closed"
)

// FinancialPeriod represents a financial/accounting period
type FinancialPeriod struct {
	ID          uuid.ID               `json:"id"`
	CompanyID   string                `json:"company_id"`
	PeriodName  string                `json:"period_name"`
	FiscalYear  int                   `json:"fiscal_year"`
	PeriodMonth int                   `json:"period_month"`
	StartDate   time.Time             `json:"start_date"`
	EndDate     time.Time             `json:"end_date"`
	Status      FinancialPeriodStatus `json:"status"`
	IsClosed    bool                  `json:"is_closed"`
	ClosedBy    string                `json:"closed_by,omitempty"`
	ClosedAt    *time.Time            `json:"closed_at,omitempty"`
	CreatedAt   time.Time             `json:"created_at"`
	UpdatedAt   time.Time             `json:"updated_at"`
}

// Close marks the financial period as closed
func (fp *FinancialPeriod) Close(userID string) error {
	now := time.Now()
	fp.IsClosed = true
	fp.Status = FinancialPeriodStatusClosed
	fp.ClosedBy = userID
	fp.ClosedAt = &now
	fp.UpdatedAt = now
	return nil
}

// Reopen reopens a closed financial period
func (fp *FinancialPeriod) Reopen() error {
	fp.IsClosed = false
	fp.Status = FinancialPeriodStatusOpen
	fp.ClosedBy = ""
	fp.ClosedAt = nil
	fp.UpdatedAt = time.Now()
	return nil
}

// IsCurrentPeriod checks if this period is the current period
func (fp *FinancialPeriod) IsCurrentPeriod() bool {
	now := time.Now()
	return !fp.StartDate.After(now) && !fp.EndDate.Before(now)
}
