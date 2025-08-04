package dto

// RecordStockMovementRequest represents the request body for recording a stock movement.
type RecordStockMovementRequest struct {
	ArticleID    string `json:"article_id" binding:"required"`
	WarehouseID  string `json:"warehouse_id" binding:"required"`
	Quantity     int    `json:"quantity" binding:"required,gt=0"`
	MovementType string `json:"movement_type" binding:"required,oneof=in out"`
	ReferenceID  string `json:"reference_id"`
}

// StockControlResponse represents the stock control data with article and warehouse details.
type StockControlResponse struct {
	ID              string             `json:"id"`
	Code            string             `json:"code"`
	Name            string             `json:"name"`
	Category        string             `json:"category"`
	Warehouse       string             `json:"warehouse"`
	WarehouseCode   string             `json:"warehouse_code"`
	CurrentStock    int                `json:"currentStock"`
	MinStock        int                `json:"minStock"`
	MaxStock        int                `json:"maxStock"`
	UnitCost        float64            `json:"unitCost"`
	TotalValue      float64            `json:"totalValue"`
	LastUpdated     string             `json:"lastUpdated"`
	Status          string             `json:"status"`
	ArticleDetails  ArticleDetails     `json:"article_details"`
	WarehouseDetails WarehouseDetails  `json:"warehouse_details"`
}

// ArticleDetails represents article information for stock control.
type ArticleDetails struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	Description  string  `json:"description"`
	Barcode      string  `json:"barcode"`
	Price        float64 `json:"price"`
}

// WarehouseDetails represents warehouse information for stock control.
type WarehouseDetails struct {
	ID          string `json:"id"`
	Code        string `json:"code"`
	Name        string `json:"name"`
	City        string `json:"city"`
	Type        string `json:"type"`
	Status      string `json:"status"`
}
