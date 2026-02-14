package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// CapexProject represents a capital expenditure project entity.
type CapexProject struct {
	types.BaseModel
	ProjectName    string    `json:"project_name" db:"project_name"`
	Description    string    `json:"description" db:"description"`
	Category       string    `json:"category" db:"category"`
	EstBudget      float64   `json:"est_budget" db:"est_budget"`
	ActualSpent    float64   `json:"actual_spent" db:"actual_spent"`
	ExpectedRoi    float64   `json:"expected_roi" db:"expected_roi"`
	Status         string    `json:"status" db:"status"`
	Priority       string    `json:"priority" db:"priority"`
	StartDate      time.Time `json:"start_date" db:"start_date"`
	CompletionDate time.Time `json:"completion_date" db:"completion_date"`
	CompanyID      string    `json:"company_id" db:"company_id"`
}
