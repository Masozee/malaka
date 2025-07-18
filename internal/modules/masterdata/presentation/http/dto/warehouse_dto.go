package dto

// CreateWarehouseRequest represents the request body for creating a new warehouse.
type CreateWarehouseRequest struct {
	Name    string `json:"name" binding:"required"`
	Address string `json:"address" binding:"required"`
}

// UpdateWarehouseRequest represents the request body for updating an existing warehouse.
type UpdateWarehouseRequest struct {
	Name    string `json:"name" binding:"required"`
	Address string `json:"address" binding:"required"`
}
