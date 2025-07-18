package entities

import (
	"malaka/internal/shared/types"
)

// Company represents a company entity.
type Company struct {
	types.BaseModel
	Name    string `json:"name"`
	Address string `json:"address"`
}
