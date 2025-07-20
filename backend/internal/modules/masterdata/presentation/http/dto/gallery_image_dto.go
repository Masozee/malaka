package dto

// CreateGalleryImageRequest represents the request body for creating a new gallery image.
type CreateGalleryImageRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	URL       string `json:"url" binding:"required,url"`
	IsPrimary bool   `json:"is_primary"`
}

// UpdateGalleryImageRequest represents the request body for updating an existing gallery image.
type UpdateGalleryImageRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	URL       string `json:"url" binding:"required,url"`
	IsPrimary bool   `json:"is_primary"`
}
