package entities

import (
	"malaka/internal/shared/types"
)

// Supplier represents a supplier entity.
type Supplier struct {
	types.BaseModel
	Name      string `json:"name" db:"name"`
	Address   string `json:"address" db:"address"`
	Contact   string `json:"contact" db:"contact"`
	CompanyID string `json:"company_id" db:"company_id"`
}
