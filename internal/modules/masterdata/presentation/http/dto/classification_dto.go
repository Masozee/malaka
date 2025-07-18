package dto

// CreateClassificationRequest represents the request body for creating a new classification.
type CreateClassificationRequest struct {
	Name string `json:"name" binding:"required"`
}

// UpdateClassificationRequest represents the request body for updating an existing classification.
type UpdateClassificationRequest struct {
	Name string `json:"name" binding:"required"`
}
