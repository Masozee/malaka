package entities

import (
	"malaka/internal/shared/types"
)

// Courier represents a courier information entity.
type Courier struct {
	types.BaseModel
	Name    string `json:"name"`
	Contact string `json:"contact"`
}
