package entities

import (
	"malaka/internal/shared/types"
)

// Barcode represents a barcode entity.
type Barcode struct {
	types.BaseModel
	ArticleID string `json:"article_id"`
	Code      string `json:"code"`
}
