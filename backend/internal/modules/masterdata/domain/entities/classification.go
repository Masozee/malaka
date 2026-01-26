package entities

import (
	"malaka/internal/shared/types"
)

// Classification represents a classification entity.
type Classification struct {
	types.BaseModel
	Code        string  `json:"code" db:"code"`
	Name        string  `json:"name" db:"name"`
	Description *string `json:"description,omitempty" db:"description"`
	ParentID    *string `json:"parent_id,omitempty" db:"parent_id"`
	Status      string  `json:"status" db:"status"`
}
