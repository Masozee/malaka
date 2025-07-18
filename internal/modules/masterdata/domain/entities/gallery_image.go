package entities

import (
	"malaka/internal/shared/types"
)

// GalleryImage represents a gallery image entity.
type GalleryImage struct {
	types.BaseModel
	ArticleID string `json:"article_id"`
	URL       string `json:"url"`
	IsPrimary bool   `json:"is_primary"`
}
