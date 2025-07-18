package dto

// CreateSizeRequest represents the request body for creating a new size.
type CreateSizeRequest struct {
	Name string `json:"name" binding:"required"`
}

// UpdateSizeRequest represents the request body for updating an existing size.
type UpdateSizeRequest struct {
	Name string `json:"name" binding:"required"`
}
