package dto

// CreateArticleRequest represents the request body for creating a new article.
type CreateArticleRequest struct {
	Name            string   `json:"name" binding:"required"`
	Description     string   `json:"description"`
	ClassificationID string   `json:"classification_id" binding:"required"`
	ColorID         string   `json:"color_id" binding:"required"`
	ModelID         string   `json:"model_id" binding:"required"`
	SizeID          string   `json:"size_id" binding:"required"`
	SupplierID      string   `json:"supplier_id" binding:"required"`
	Barcode         string   `json:"barcode"`
	Price           float64  `json:"price" binding:"required,gt=0"`
	ImageURL        string   `json:"image_url,omitempty"`
	ImageURLs       []string `json:"image_urls,omitempty"`
	ThumbnailURL    string   `json:"thumbnail_url,omitempty"`
}

// UpdateArticleRequest represents the request body for updating an existing article.
type UpdateArticleRequest struct {
	Name            string   `json:"name" binding:"required"`
	Description     string   `json:"description"`
	ClassificationID string   `json:"classification_id" binding:"required"`
	ColorID         string   `json:"color_id" binding:"required"`
	ModelID         string   `json:"model_id" binding:"required"`
	SizeID          string   `json:"size_id" binding:"required"`
	SupplierID      string   `json:"supplier_id" binding:"required"`
	Barcode         string   `json:"barcode"`
	Price           float64  `json:"price" binding:"required,gt=0"`
	ImageURL        string   `json:"image_url,omitempty"`
	ImageURLs       []string `json:"image_urls,omitempty"`
	ThumbnailURL    string   `json:"thumbnail_url,omitempty"`
}
