package dto

// CreatePromotionRequest represents the request body for creating a new promotion.
type CreatePromotionRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	StartDate   string  `json:"start_date" binding:"required"`
	EndDate     string  `json:"end_date" binding:"required"`
	DiscountRate float64 `json:"discount_rate" binding:"required,min=0,max=1"`
	MinPurchase float64 `json:"min_purchase" binding:"required,min=0"`
}

// UpdatePromotionRequest represents the request body for updating an existing promotion.
type UpdatePromotionRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	StartDate   string  `json:"start_date" binding:"required"`
	EndDate     string  `json:"end_date" binding:"required"`
	DiscountRate float64 `json:"discount_rate" binding:"required,min=0,max=1"`
	MinPurchase float64 `json:"min_purchase" binding:"required,min=0"`
}
