package dto

// CreateAirwaybillRequest represents the request body for creating a new airwaybill.
type CreateAirwaybillRequest struct {
	ShipmentID  string `json:"shipment_id" binding:"required"`
	AWBNumber   string `json:"awb_number" binding:"required"`
	IssueDate   string `json:"issue_date" binding:"required"`
	Origin      string `json:"origin" binding:"required"`
	Destination string `json:"destination" binding:"required"`
}

// UpdateAirwaybillRequest represents the request body for updating an existing airwaybill.
type UpdateAirwaybillRequest struct {
	ShipmentID  string `json:"shipment_id" binding:"required"`
	AWBNumber   string `json:"awb_number" binding:"required"`
	IssueDate   string `json:"issue_date" binding:"required"`
	Origin      string `json:"origin" binding:"required"`
	Destination string `json:"destination" binding:"required"`
}
