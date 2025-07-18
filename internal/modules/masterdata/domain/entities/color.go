package entities

import (
	"malaka/internal/shared/types"
)

// Color represents a color entity.
type Color struct {
	types.BaseModel
	Name string `json:"name"`
	Hex  string `json:"hex"`
}
