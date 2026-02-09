package entities

import (
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// Model represents a model entity.
type Model struct {
	types.BaseModel
	Code        string   `json:"code" db:"code"`
	Name        string   `json:"name" db:"name"`
	Description *string  `json:"description,omitempty" db:"description"`
	ArticleID   *uuid.ID `json:"article_id,omitempty" db:"article_id"`
	CompanyID   string   `json:"company_id" db:"company_id"`
	Status      string   `json:"status" db:"status"`
}
