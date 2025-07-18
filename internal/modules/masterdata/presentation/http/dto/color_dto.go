package dto

// CreateColorRequest represents the request body for creating a new color.
type CreateColorRequest struct {
	Name string `json:"name" binding:"required"`
	Hex  string `json:"hex" binding:"required"`
}

// UpdateColorRequest represents the request body for updating an existing color.
type UpdateColorRequest struct {
	Name string `json:"name" binding:"required"`
	Hex  string `json:"hex" binding:"required"`
}
