package dto

// CreateShipmentRequest represents the request body for creating a new shipment.
type CreateShipmentRequest struct {
	SalesOrderID string `json:"sales_order_id" binding:"required"`
	TrackingNumber string `json:"tracking_number"`
	CourierID    string `json:"courier_id" binding:"required"`
}

// UpdateShipmentRequest represents the request body for updating an existing shipment.
type UpdateShipmentRequest struct {
	SalesOrderID string `json:"sales_order_id" binding:"required"`
	Status       string `json:"status" binding:"required"`
	TrackingNumber string `json:"tracking_number"`
	CourierID    string `json:"courier_id" binding:"required"`
}
