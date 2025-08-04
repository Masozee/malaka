package entities

import (
	"malaka/internal/shared/types"
)

// Company represents a company entity.
type Company struct {
	types.BaseModel
	Name    string `json:"name"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
	Status  string `json:"status"`
}
