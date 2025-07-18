package entities

import (
	"malaka/internal/shared/types"
)

// Size represents a size entity.
type Size struct {
	types.BaseModel
	Name string `json:"name"`
}
