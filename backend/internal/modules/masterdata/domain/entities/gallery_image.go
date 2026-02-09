package entities

import (
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// GalleryImage represents a gallery image entity.
type GalleryImage struct {
	types.BaseModel
	ArticleID uuid.ID `json:"article_id" db:"article_id"`
	CompanyID string  `json:"company_id" db:"company_id"`
	URL       string  `json:"url" db:"url"`
	IsPrimary bool    `json:"is_primary" db:"is_primary"`
}
