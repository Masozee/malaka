package dto

// CreateArticleRequest represents the request body for creating a new article.
type CreateArticleRequest struct {
	Name            string  `json:"name" binding:"required"`
	Description     string  `json:"description"`
	ClassificationID string  `json:"classification_id" binding:"required"`
	ColorID         string  `json:"color_id" binding:"required"`
	ModelID         string  `json:"model_id" binding:"required"`
	SizeID          string  `json:"size_id" binding:"required"`
	SupplierID      string  `json:"supplier_id" binding:"required"`
	Barcode         string  `json:"barcode"`
	Price           float64 `json:"price" binding:"required,gt=0"`
}

// UpdateArticleRequest represents the request body for updating an existing article.
type UpdateArticleRequest struct {
	Name            string  `json:"name" binding:"required"`
	Description     string  `json:"description"`
	ClassificationID string  `json:"classification_id" binding:"required"`
	ColorID         string  `json:"color_id" binding:"required"`
	ModelID         string  `json:"model_id" binding:"required"`
	SizeID          string  `json:"size_id" binding:"required"`
	SupplierID      string  `json:"supplier_id" binding:"required"`
	Barcode         string  `json:"barcode"`
	Price           float64 `json:"price" binding:"required,gt=0"`
}
