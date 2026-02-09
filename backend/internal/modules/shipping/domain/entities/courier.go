package entities

import (
	"malaka/internal/shared/types"
)

// Courier represents a courier information entity.
type Courier struct {
	types.BaseModel
	Name      string `json:"name" db:"name"`
	Contact   string `json:"contact" db:"contact"`
	CompanyID string `json:"company_id" db:"company_id"`
}
