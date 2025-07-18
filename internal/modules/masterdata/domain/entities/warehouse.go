package entities

import (
	"malaka/internal/shared/types"
)

// Warehouse represents a warehouse entity.
type Warehouse struct {
	types.BaseModel
	Name    string `json:"name"`
	Address string `json:"address"`
}
