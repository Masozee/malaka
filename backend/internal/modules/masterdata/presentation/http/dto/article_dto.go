package dto

// CreateArticleRequest represents the request body for creating a new article.
type CreateArticleRequest struct {
	Code             string   `json:"code" binding:"required"`
	Name             string   `json:"name" binding:"required"`
	Brand            string   `json:"brand"`
	Category         string   `json:"category"`
	Gender           string   `json:"gender"`
	Description      string   `json:"description"`
	ClassificationID string   `json:"classification_id" binding:"required"`
	ColorID          string   `json:"color_id"`
	ModelID          string   `json:"model_id"`
	SizeID           string   `json:"size_id"`
	SupplierID       string   `json:"supplier_id"`
	Barcode          string   `json:"barcode"`
	Price            float64  `json:"price"`
	Status           string   `json:"status"`
	ImageURL         string   `json:"image_url,omitempty"`
	ImageURLs        []string `json:"image_urls,omitempty"`
	ThumbnailURL     string   `json:"thumbnail_url,omitempty"`
}

// UpdateArticleRequest represents the request body for updating an existing article.
// Fields are optional for partial updates - only provided fields will be updated.
type UpdateArticleRequest struct {
	Code             string   `json:"code"`
	Name             string   `json:"name"`
	Brand            string   `json:"brand"`
	Category         string   `json:"category"`
	Gender           string   `json:"gender"`
	Description      string   `json:"description"`
	ClassificationID string   `json:"classification_id"`
	ColorID          string   `json:"color_id"`
	ModelID          string   `json:"model_id"`
	SizeID           string   `json:"size_id"`
	SupplierID       string   `json:"supplier_id"`
	Barcode          string   `json:"barcode"`
	Price            float64  `json:"price"`
	Status           string   `json:"status"`
	ImageURL         string   `json:"image_url,omitempty"`
	ImageURLs        []string `json:"image_urls,omitempty"`
	ThumbnailURL     string   `json:"thumbnail_url,omitempty"`
}
