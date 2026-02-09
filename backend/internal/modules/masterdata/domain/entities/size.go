package entities

import (
	"malaka/internal/shared/types"
)

// Size represents a size entity.
type Size struct {
	types.BaseModel
	Code         string  `json:"code" db:"code"`
	Name         string  `json:"name" db:"name"`
	Description  *string `json:"description,omitempty" db:"description"`
	SizeCategory string  `json:"size_category" db:"size_category"`
	SortOrder    int     `json:"sort_order" db:"sort_order"`
	CompanyID    string  `json:"company_id" db:"company_id"`
	Status       string  `json:"status" db:"status"`
}
