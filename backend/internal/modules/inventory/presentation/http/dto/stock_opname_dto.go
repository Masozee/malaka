package dto

import "time"

// CreateOpnameItemRequest represents a single item in an opname creation request.
type CreateOpnameItemRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	SystemQty int    `json:"system_qty"`
	ActualQty int    `json:"actual_qty"`
	Notes     string `json:"notes"`
}

// CreateStockOpnameRequest represents the request payload for creating a stock opname.
type CreateStockOpnameRequest struct {
	WarehouseID string                    `json:"warehouse_id" binding:"required"`
	OpnameDate  time.Time                 `json:"opname_date" binding:"required"`
	Status      string                    `json:"status" binding:"required"`
	Notes       string                    `json:"notes"`
	Items       []CreateOpnameItemRequest `json:"items"`
}

// UpdateStockOpnameRequest represents the request payload for updating a stock opname.
type UpdateStockOpnameRequest struct {
	WarehouseID string                    `json:"warehouse_id"`
	OpnameDate  time.Time                 `json:"opname_date"`
	Status      string                    `json:"status"`
	Notes       string                    `json:"notes"`
	Items       []CreateOpnameItemRequest `json:"items"`
}

// StockOpnameResponse represents the response payload for stock opname operations.
type StockOpnameResponse struct {
	ID          string    `json:"id"`
	WarehouseID string    `json:"warehouse_id"`
	OpnameDate  time.Time `json:"opname_date"`
	Status      string    `json:"status"`
	Notes       string    `json:"notes"`
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
	Notes         string `json:"notes"`
	TotalItems    int    `json:"totalItems"`
	CreatedAt     string `json:"createdAt"`
	UpdatedAt     string `json:"updatedAt"`
}

// StockOpnameItemResponse is the enriched JSON response for an opname item.
type StockOpnameItemResponse struct {
	ID          string `json:"id"`
	ArticleID   string `json:"articleId"`
	ArticleName string `json:"articleName"`
	ArticleCode string `json:"articleCode"`
	SystemQty   int    `json:"systemQty"`
	ActualQty   int    `json:"actualQty"`
	Variance    int    `json:"variance"`
	Notes       string `json:"notes"`
}

// StockOpnameDetailResponse is the enriched detail response including items.
type StockOpnameDetailResponse struct {
	StockOpnameListResponse
	Items []StockOpnameItemResponse `json:"items"`
}
