package dto

import (
	"time"

	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/shared/uuid"
)

// CreatePurchaseOrderItemRequest represents a request to create a purchase order item
type CreatePurchaseOrderItemRequest struct {
	ItemName           string  `json:"item_name" binding:"required"`
	Description        string  `json:"description"`
	Specification      string  `json:"specification"`
	Quantity           int     `json:"quantity" binding:"required,min=1"`
	Unit               string  `json:"unit" binding:"required"`
	UnitPrice          float64 `json:"unit_price" binding:"required,min=0"`
	DiscountPercentage float64 `json:"discount_percentage"`
	TaxPercentage      float64 `json:"tax_percentage"`
	Currency           string  `json:"currency"`
}

// CreatePurchaseOrderRequest represents a request to create a purchase order
type CreatePurchaseOrderRequest struct {
	SupplierID           string                           `json:"supplier_id" binding:"required"`
	PurchaseRequestID    *string                          `json:"purchase_request_id"`
	ExpectedDeliveryDate *time.Time                       `json:"expected_delivery_date"`
	DeliveryAddress      string                           `json:"delivery_address" binding:"required"`
	PaymentTerms         string                           `json:"payment_terms" binding:"required"`
	Currency             string                           `json:"currency"`
	ShippingCost         float64                          `json:"shipping_cost"`
	Notes                string                           `json:"notes"`
	Items                []CreatePurchaseOrderItemRequest `json:"items" binding:"required,min=1,dive"`
}

// UpdatePurchaseOrderItemRequest represents a request to update a purchase order item
type UpdatePurchaseOrderItemRequest struct {
	ID                 string  `json:"id"`
	ItemName           string  `json:"item_name"`
	Description        string  `json:"description"`
	Specification      string  `json:"specification"`
	Quantity           int     `json:"quantity"`
	Unit               string  `json:"unit"`
	UnitPrice          float64 `json:"unit_price"`
	DiscountPercentage float64 `json:"discount_percentage"`
	TaxPercentage      float64 `json:"tax_percentage"`
	Currency           string  `json:"currency"`
}

// UpdatePurchaseOrderRequest represents a request to update a purchase order
type UpdatePurchaseOrderRequest struct {
	SupplierID           string                           `json:"supplier_id"`
	PurchaseRequestID    *string                          `json:"purchase_request_id"`
	ExpectedDeliveryDate *time.Time                       `json:"expected_delivery_date"`
	DeliveryAddress      string                           `json:"delivery_address"`
	PaymentTerms         string                           `json:"payment_terms"`
	Currency             string                           `json:"currency"`
	ShippingCost         float64                          `json:"shipping_cost"`
	Notes                string                           `json:"notes"`
	Items                []UpdatePurchaseOrderItemRequest `json:"items"`
}

// ReceiveItemRequest represents a request to receive an item
type ReceiveItemRequest struct {
	ItemID   string `json:"item_id" binding:"required"`
	Quantity int    `json:"quantity" binding:"required,min=0"`
}

// ReceivePurchaseOrderRequest represents a request to receive a purchase order
type ReceivePurchaseOrderRequest struct {
	Items []ReceiveItemRequest `json:"items" binding:"required,min=1,dive"`
}

// CancelPurchaseOrderRequest represents a request to cancel a purchase order
type CancelPurchaseOrderRequest struct {
	Reason string `json:"reason"`
}

// PurchaseOrderResponse represents a purchase order response
type PurchaseOrderResponse struct {
	ID                   string                      `json:"id"`
	PONumber             string                      `json:"po_number"`
	SupplierID           string                      `json:"supplier_id"`
	SupplierName         string                      `json:"supplier_name"`
	PurchaseRequestID    *string                     `json:"purchase_request_id,omitempty"`
	OrderDate            time.Time                   `json:"order_date"`
	ExpectedDeliveryDate *time.Time                  `json:"expected_delivery_date,omitempty"`
	DeliveryAddress      string                      `json:"delivery_address"`
	PaymentTerms         string                      `json:"payment_terms"`
	Currency             string                      `json:"currency"`
	Subtotal             float64                     `json:"subtotal"`
	DiscountAmount       float64                     `json:"discount_amount"`
	TaxAmount            float64                     `json:"tax_amount"`
	ShippingCost         float64                     `json:"shipping_cost"`
	TotalAmount          float64                     `json:"total_amount"`
	Status               string                      `json:"status"`
	PaymentStatus        string                      `json:"payment_status"`
	Notes                string                      `json:"notes,omitempty"`
	CreatedBy            string                      `json:"created_by"`
	CreatedByName        string                      `json:"created_by_name"`
	CreatedByPosition    string                      `json:"created_by_position"`
	ApprovedBy           *string                     `json:"approved_by,omitempty"`
	ApprovedAt           *time.Time                  `json:"approved_at,omitempty"`
	SentAt               *time.Time                  `json:"sent_at,omitempty"`
	ConfirmedAt          *time.Time                  `json:"confirmed_at,omitempty"`
	ReceivedAt           *time.Time                  `json:"received_at,omitempty"`
	CancelledAt          *time.Time                  `json:"cancelled_at,omitempty"`
	CancelReason         string                      `json:"cancel_reason,omitempty"`
	CreatedAt            time.Time                   `json:"created_at"`
	UpdatedAt            time.Time                   `json:"updated_at"`
	Items                []PurchaseOrderItemResponse `json:"items,omitempty"`
}

// PurchaseOrderItemResponse represents a purchase order item response
type PurchaseOrderItemResponse struct {
	ID                 string    `json:"id"`
	PurchaseOrderID    string    `json:"purchase_order_id"`
	ItemName           string    `json:"item_name"`
	Description        string    `json:"description,omitempty"`
	Specification      string    `json:"specification,omitempty"`
	Quantity           int       `json:"quantity"`
	Unit               string    `json:"unit"`
	UnitPrice          float64   `json:"unit_price"`
	DiscountPercentage float64   `json:"discount_percentage"`
	TaxPercentage      float64   `json:"tax_percentage"`
	LineTotal          float64   `json:"line_total"`
	ReceivedQuantity   int       `json:"received_quantity"`
	Currency           string    `json:"currency"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// ToResponse converts a purchase order entity to a response
func ToPurchaseOrderResponse(order *entities.PurchaseOrder) *PurchaseOrderResponse {
	if order == nil {
		return nil
	}

	// Convert PurchaseRequestID from *uuid.ID to *string
	var purchaseRequestIDStr *string
	if order.PurchaseRequestID != nil && !order.PurchaseRequestID.IsNil() {
		str := order.PurchaseRequestID.String()
		purchaseRequestIDStr = &str
	}

	// Convert ApprovedBy from *uuid.ID to *string
	var approvedByStr *string
	if order.ApprovedBy != nil && !order.ApprovedBy.IsNil() {
		str := order.ApprovedBy.String()
		approvedByStr = &str
	}

	response := &PurchaseOrderResponse{
		ID:                   order.ID.String(),
		PONumber:             order.PONumber,
		SupplierID:           order.SupplierID.String(),
		SupplierName:         order.SupplierName,
		PurchaseRequestID:    purchaseRequestIDStr,
		OrderDate:            order.OrderDate,
		ExpectedDeliveryDate: order.ExpectedDeliveryDate,
		DeliveryAddress:      order.DeliveryAddress,
		PaymentTerms:         order.PaymentTerms,
		Currency:             order.Currency,
		Subtotal:             order.Subtotal,
		DiscountAmount:       order.DiscountAmount,
		TaxAmount:            order.TaxAmount,
		ShippingCost:         order.ShippingCost,
		TotalAmount:          order.TotalAmount,
		Status:               string(order.Status),
		PaymentStatus:        string(order.PaymentStatus),
		Notes:                order.Notes,
		CreatedBy:            order.CreatedBy.String(),
		CreatedByName:        order.CreatedByName,
		CreatedByPosition:    order.CreatedByPosition,
		ApprovedBy:           approvedByStr,
		ApprovedAt:           order.ApprovedAt,
		SentAt:               order.SentAt,
		ConfirmedAt:          order.ConfirmedAt,
		ReceivedAt:           order.ReceivedAt,
		CancelledAt:          order.CancelledAt,
		CancelReason:         order.CancelReason,
		CreatedAt:            order.CreatedAt,
		UpdatedAt:            order.UpdatedAt,
	}

	for _, item := range order.Items {
		response.Items = append(response.Items, PurchaseOrderItemResponse{
			ID:                 item.ID.String(),
			PurchaseOrderID:    item.PurchaseOrderID.String(),
			ItemName:           item.ItemName,
			Description:        item.Description,
			Specification:      item.Specification,
			Quantity:           item.Quantity,
			Unit:               item.Unit,
			UnitPrice:          item.UnitPrice,
			DiscountPercentage: item.DiscountPercentage,
			TaxPercentage:      item.TaxPercentage,
			LineTotal:          item.LineTotal,
			ReceivedQuantity:   item.ReceivedQuantity,
			Currency:           item.Currency,
			CreatedAt:          item.CreatedAt,
			UpdatedAt:          item.UpdatedAt,
		})
	}

	return response
}

// PurchaseOrderItemEntity is a helper struct for converting item requests to entities
type PurchaseOrderItemEntity struct {
	ItemName           string
	Description        string
	Specification      string
	Quantity           int
	Unit               string
	UnitPrice          float64
	DiscountPercentage float64
	TaxPercentage      float64
	Currency           string
}

// ToEntity converts a PurchaseOrderItemEntity to an entity
func (i *PurchaseOrderItemEntity) ToEntity() *entities.PurchaseOrderItem {
	item := entities.NewPurchaseOrderItem(uuid.ID{})
	item.ItemName = i.ItemName
	item.Description = i.Description
	item.Specification = i.Specification
	item.Quantity = i.Quantity
	item.Unit = i.Unit
	item.UnitPrice = i.UnitPrice
	item.DiscountPercentage = i.DiscountPercentage
	item.TaxPercentage = i.TaxPercentage
	item.Currency = i.Currency
	return item
}

// ToEntity converts a create request to an entity
func (r *CreatePurchaseOrderRequest) ToEntity(createdBy string) *entities.PurchaseOrder {
	order := entities.NewPurchaseOrder(uuid.MustParse(r.SupplierID), uuid.MustParse(createdBy))
	// Only set purchase_request_id if it's not nil and not empty
	if r.PurchaseRequestID != nil && *r.PurchaseRequestID != "" {
		prID := uuid.MustParse(*r.PurchaseRequestID)
		order.PurchaseRequestID = &prID
	}
	order.ExpectedDeliveryDate = r.ExpectedDeliveryDate
	order.DeliveryAddress = r.DeliveryAddress
	order.PaymentTerms = r.PaymentTerms
	order.ShippingCost = r.ShippingCost
	order.Notes = r.Notes

	if r.Currency != "" {
		order.Currency = r.Currency
	}

	for _, itemReq := range r.Items {
		item := entities.NewPurchaseOrderItem(order.ID)
		item.ItemName = itemReq.ItemName
		item.Description = itemReq.Description
		item.Specification = itemReq.Specification
		item.Quantity = itemReq.Quantity
		item.Unit = itemReq.Unit
		item.UnitPrice = itemReq.UnitPrice
		item.DiscountPercentage = itemReq.DiscountPercentage
		item.TaxPercentage = itemReq.TaxPercentage
		if itemReq.Currency != "" {
			item.Currency = itemReq.Currency
		} else {
			item.Currency = order.Currency
		}
		order.Items = append(order.Items, *item)
	}

	return order
}
