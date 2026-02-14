package entities

import (
	"malaka/internal/shared/types"
)

// Budget represents a budget entity.
type Budget struct {
	types.BaseModel
	Department string  `json:"department" db:"department"`
	Category   string  `json:"category" db:"category"`
	FiscalYear string  `json:"fiscal_year" db:"fiscal_year"`
	Allocated  float64 `json:"allocated" db:"allocated"`
	Spent      float64 `json:"spent" db:"spent"`
	Status     string  `json:"status" db:"status"`
	CompanyID  string  `json:"company_id" db:"company_id"`
}
