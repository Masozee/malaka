package dto

// CreatePriceRequest represents the request body for creating a new price.
type CreatePriceRequest struct {
	ArticleID string  `json:"article_id" binding:"required"`
	Amount    float64 `json:"amount" binding:"required,gt=0"`
	Currency  string  `json:"currency" binding:"required"`
	EffectiveDate string `json:"effective_date" binding:"required"`
}

// UpdatePriceRequest represents the request body for updating an existing price.
type UpdatePriceRequest struct {
	ArticleID string  `json:"article_id" binding:"required"`
	Amount    float64 `json:"amount" binding:"required,gt=0"`
	Currency  string  `json:"currency" binding:"required"`
	EffectiveDate string `json:"effective_date" binding:"required"`
}
