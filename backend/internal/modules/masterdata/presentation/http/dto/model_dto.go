package dto

// CreateModelRequest represents the request body for creating a new model.
type CreateModelRequest struct {
	Name string `json:"name" binding:"required"`
}

// UpdateModelRequest represents the request body for updating an existing model.
type UpdateModelRequest struct {
	Name string `json:"name" binding:"required"`
}
