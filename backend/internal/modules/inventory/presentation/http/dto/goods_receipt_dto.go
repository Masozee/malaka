package dto

import "time"

// CreateGoodsReceiptRequest represents the request body for creating a new goods receipt.
type CreateGoodsReceiptRequest struct {
	PurchaseOrderID string `json:"purchase_order_id" binding:"required"`
	WarehouseID     string `json:"warehouse_id" binding:"required"`
}

// UpdateGoodsReceiptRequest represents the request body for updating an existing goods receipt.
type UpdateGoodsReceiptRequest struct {
	PurchaseOrderID string `json:"purchase_order_id" binding:"required"`
	WarehouseID     string `json:"warehouse_id" binding:"required"`
}

// GoodsReceiptResponse represents the response for goods receipt with related information
type GoodsReceiptResponse struct {
	ID              string                     `json:"id"`
	PurchaseOrderID string                     `json:"purchase_order_id"`
	ReceiptDate     time.Time                  `json:"receipt_date"`
	WarehouseID     string                     `json:"warehouse_id"`
	CreatedAt       time.Time                  `json:"created_at"`
	UpdatedAt       time.Time                  `json:"updated_at"`
	
	// Related information
	ReceiptNumber   string                     `json:"receiptNumber"`
	SupplierName    string                     `json:"supplierName"`
	PONumber        string                     `json:"poNumber"`
	Warehouse       string                     `json:"warehouse"`
	Status          string                     `json:"status"`
	TotalAmount     float64                    `json:"totalAmount"`
	TotalItems      int                        `json:"totalItems"`
	Items           []GoodsReceiptItemResponse `json:"items"`
}

// GoodsReceiptItemResponse represents a goods receipt item with product information
type GoodsReceiptItemResponse struct {
	ID          string  `json:"id"`
	ProductCode string  `json:"productCode"`
	ProductName string  `json:"productName"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unitPrice"`
	TotalPrice  float64 `json:"totalPrice"`
}
