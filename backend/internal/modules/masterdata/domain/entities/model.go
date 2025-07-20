package entities

import (
	"malaka/internal/shared/types"
)

// Model represents a model entity.
type Model struct {
	types.BaseModel
	Name string `json:"name"`
}
