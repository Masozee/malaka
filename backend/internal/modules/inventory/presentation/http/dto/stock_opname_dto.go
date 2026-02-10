package dto

import "time"

// CreateStockOpnameRequest represents the request payload for creating a stock opname.
type CreateStockOpnameRequest struct {
	WarehouseID string    `json:"warehouse_id" binding:"required"`
	OpnameDate  time.Time `json:"opname_date" binding:"required"`
	Status      string    `json:"status" binding:"required"`
}

// UpdateStockOpnameRequest represents the request payload for updating a stock opname.
type UpdateStockOpnameRequest struct {
	WarehouseID string    `json:"warehouse_id"`
	OpnameDate  time.Time `json:"opname_date"`
	Status      string    `json:"status"`
}

// StockOpnameResponse represents the response payload for stock opname operations.
type StockOpnameResponse struct {
	ID          string    `json:"id"`
	WarehouseID string    `json:"warehouse_id"`
	OpnameDate  time.Time `json:"opname_date"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// StockOpnameListResponse is the enriched JSON response for stock opname list.
type StockOpnameListResponse struct {
	ID            string `json:"id"`
	OpnameNumber  string `json:"opnameNumber"`
	WarehouseID   string `json:"warehouseId"`
	WarehouseName string `json:"warehouseName"`
	WarehouseCode string `json:"warehouseCode"`
	OpnameDate    string `json:"opnameDate"`
	Status        string `json:"status"`
	CreatedAt     string `json:"createdAt"`
	UpdatedAt     string `json:"updatedAt"`
}