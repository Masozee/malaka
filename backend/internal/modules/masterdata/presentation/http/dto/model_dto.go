package dto

// CreateModelRequest represents the request body for creating a new model.
type CreateModelRequest struct {
	Code        string  `json:"code" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description,omitempty"`
	ArticleID   *string `json:"article_id,omitempty"`
	Status      string  `json:"status"`
}

// UpdateModelRequest represents the request body for updating an existing model.
type UpdateModelRequest struct {
	Code        string  `json:"code" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description,omitempty"`
	ArticleID   *string `json:"article_id,omitempty"`
	Status      string  `json:"status"`
}
