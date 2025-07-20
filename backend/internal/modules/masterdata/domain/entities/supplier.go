package entities

import (
	"malaka/internal/shared/types"
)

// Supplier represents a supplier entity.
type Supplier struct {
	types.BaseModel
	Name    string `json:"name"`
	Address string `json:"address"`
	Contact string `json:"contact"`
}
