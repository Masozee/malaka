package entities

import (
	"malaka/internal/shared/types"
)

// Company represents a company entity.
type Company struct {
	types.BaseModel
	Name    string `json:"name" db:"name"`
	Email   string `json:"email" db:"email"`
	Phone   string `json:"phone" db:"phone"`
	Address string `json:"address" db:"address"`
	Status  string `json:"status" db:"status"`
}
