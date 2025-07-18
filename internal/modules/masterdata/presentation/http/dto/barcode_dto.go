package dto

// CreateBarcodeRequest represents the request body for creating a new barcode.
type CreateBarcodeRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	Code      string `json:"code" binding:"required"`
}

// UpdateBarcodeRequest represents the request body for updating an existing barcode.
type UpdateBarcodeRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	Code      string `json:"code" binding:"required"`
}
