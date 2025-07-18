package dto

// RecordStockMovementRequest represents the request body for recording a stock movement.
type RecordStockMovementRequest struct {
	ArticleID    string `json:"article_id" binding:"required"`
	WarehouseID  string `json:"warehouse_id" binding:"required"`
	Quantity     int    `json:"quantity" binding:"required,gt=0"`
	MovementType string `json:"movement_type" binding:"required,oneof=in out"`
	ReferenceID  string `json:"reference_id"`
}
