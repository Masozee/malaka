package entities

import (
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// Barcode represents a barcode entity.
type Barcode struct {
	types.BaseModel
	ArticleID uuid.ID `json:"article_id" db:"article_id"`
	CompanyID string  `json:"company_id" db:"company_id"`
	Code      string  `json:"code" db:"code"`
}
