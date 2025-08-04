package entities

import (
	"malaka/internal/shared/types"
)

// Model represents a model entity.
type Model struct {
	types.BaseModel
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	ArticleID   *string `json:"article_id,omitempty"`
	Status      string  `json:"status"`
}
