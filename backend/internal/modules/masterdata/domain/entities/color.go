package entities

import (
	"malaka/internal/shared/types"
)

// Color represents a color entity.
type Color struct {
	types.BaseModel
	Code        string `json:"code"`
	Name        string `json:"name"`
	HexCode     string `json:"hex_code"`
	Description string `json:"description"`
	Status      string `json:"status"`
}
