package entities

import (
	"malaka/internal/shared/types"
)

// Customer represents a customer entity.
type Customer struct {
	types.BaseModel
	Name    string `json:"name"`
	Address string `json:"address"`
	Contact string `json:"contact"`
}
