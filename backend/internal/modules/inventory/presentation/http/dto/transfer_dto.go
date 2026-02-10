package dto

// CreateTransferOrderItemRequest represents a single item in a transfer order creation request.
type CreateTransferOrderItemRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,gt=0"`
}

// CreateTransferOrderRequest represents the request body for creating a new transfer order.
type CreateTransferOrderRequest struct {
	FromWarehouseID string                           `json:"from_warehouse_id" binding:"required"`
	ToWarehouseID   string                           `json:"to_warehouse_id" binding:"required"`
	Notes           string                           `json:"notes"`
	Items           []CreateTransferOrderItemRequest `json:"items" binding:"required,min=1"`
}

// UpdateTransferOrderRequest represents the request body for updating an existing transfer order.
type UpdateTransferOrderRequest struct {
	FromWarehouseID string `json:"from_warehouse_id" binding:"required"`
	ToWarehouseID   string `json:"to_warehouse_id" binding:"required"`
	Status          string `json:"status" binding:"required"`
}

// ReceiveTransferItemRequest represents a single received item.
type ReceiveTransferItemRequest struct {
	ItemID           string `json:"item_id" binding:"required"`
	ReceivedQuantity int    `json:"received_quantity" binding:"required,gte=0"`
}

// ReceiveTransferRequest is the request body for receiving a transfer.
type ReceiveTransferRequest struct {
	Items []ReceiveTransferItemRequest `json:"items" binding:"required,min=1"`
}

// CancelTransferRequest is the request body for cancelling a transfer.
type CancelTransferRequest struct {
	Reason string `json:"reason"`
}

// TransferOrderResponse is the enriched JSON response for a transfer order.
type TransferOrderResponse struct {
	ID              string  `json:"id"`
	TransferNumber  string  `json:"transferNumber"`
	FromWarehouseID string  `json:"fromWarehouseId"`
	FromWarehouse   string  `json:"fromWarehouse"`
	FromCode        string  `json:"fromCode"`
	ToWarehouseID   string  `json:"toWarehouseId"`
	ToWarehouse     string  `json:"toWarehouse"`
	ToCode          string  `json:"toCode"`
	OrderDate       string  `json:"orderDate"`
	Status          string  `json:"status"`
	Notes           string  `json:"notes"`
	TotalItems      int     `json:"totalItems"`
	TotalQuantity   int     `json:"totalQuantity"`
	ShippedDate     *string `json:"shippedDate,omitempty"`
	ReceivedDate    *string `json:"receivedDate,omitempty"`
	ApprovedDate    *string `json:"approvedDate,omitempty"`
	CancelledDate   *string `json:"cancelledDate,omitempty"`
	ShippedBy       *string `json:"shippedBy,omitempty"`
	ReceivedBy      *string `json:"receivedBy,omitempty"`
	ApprovedBy      *string `json:"approvedBy,omitempty"`
	CancelledBy     *string `json:"cancelledBy,omitempty"`
	CreatedBy       *string `json:"createdBy,omitempty"`
	ShippedByName   string  `json:"shippedByName,omitempty"`
	ReceivedByName  string  `json:"receivedByName,omitempty"`
	ApprovedByName  string  `json:"approvedByName,omitempty"`
	CancelledByName string  `json:"cancelledByName,omitempty"`
	CreatedByName   string  `json:"createdByName,omitempty"`
	CancelReason    string  `json:"cancelReason,omitempty"`
	CreatedAt       string  `json:"createdAt"`
	UpdatedAt       string  `json:"updatedAt"`
}

// TransferItemResponse is the enriched JSON response for a transfer item.
type TransferItemResponse struct {
	ID               string `json:"id"`
	ArticleID        string `json:"articleId"`
	ArticleName      string `json:"articleName"`
	ArticleCode      string `json:"articleCode"`
	Quantity         int    `json:"quantity"`
	ReceivedQuantity int    `json:"receivedQuantity"`
	HasDiscrepancy   bool   `json:"hasDiscrepancy"`
}

// TransferOrderDetailResponse is the enriched detail response including items.
type TransferOrderDetailResponse struct {
	TransferOrderResponse
	Items []TransferItemResponse `json:"items"`
}
