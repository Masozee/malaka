package dto

// CreateColorRequest represents the request body for creating a new color.
type CreateColorRequest struct {
	Code        string `json:"code" binding:"required"`
	Name        string `json:"name" binding:"required"`
	HexCode     string `json:"hex_code" binding:"required"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

// UpdateColorRequest represents the request body for updating an existing color.
type UpdateColorRequest struct {
	Code        string `json:"code" binding:"required"`
	Name        string `json:"name" binding:"required"`
	HexCode     string `json:"hex_code" binding:"required"`
	Description string `json:"description"`
	Status      string `json:"status"`
}
