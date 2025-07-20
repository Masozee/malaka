package entities

import (
	"malaka/internal/shared/types"
)

// Classification represents a classification entity.
type Classification struct {
	types.BaseModel
	Name string `json:"name"`
}
