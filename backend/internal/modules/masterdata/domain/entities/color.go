package entities

import (
	"malaka/internal/shared/types"
)

// Color represents a color entity.
type Color struct {
	types.BaseModel
	Code        string `json:"code" db:"code"`
	Name        string `json:"name" db:"name"`
	HexCode     string `json:"hex_code" db:"hex_code"`
	Description string `json:"description" db:"description"`
	CompanyID   string `json:"company_id" db:"company_id"`
	Status      string `json:"status" db:"status"`
}
