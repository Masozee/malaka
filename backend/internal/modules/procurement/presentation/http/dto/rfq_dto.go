package dto

import (
	"time"

	"malaka/internal/modules/procurement/domain/entities"
)

// CreateRFQRequest represents the request to create a new RFQ
type CreateRFQRequest struct {
	Title       string                    `json:"title" binding:"required"`
	Description string                    `json:"description"`
	Priority    string                    `json:"priority"`
	CreatedBy   string                    `json:"created_by"`
	DueDate     *time.Time                `json:"due_date"`
	Items       []*CreateRFQItemRequest   `json:"items"`
	SupplierIDs []string                  `json:"supplier_ids"`
}

// CreateRFQItemRequest represents an item in the RFQ creation request
type CreateRFQItemRequest struct {
	ItemName      string  `json:"item_name" binding:"required"`
	Description   string  `json:"description"`
	Specification string  `json:"specification"`
	Quantity      int     `json:"quantity" binding:"required,gt=0"`
	Unit          string  `json:"unit"`
	TargetPrice   float64 `json:"target_price"`
}

// UpdateRFQRequest represents the request to update an RFQ
type UpdateRFQRequest struct {
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Priority    string     `json:"priority"`
	DueDate     *time.Time `json:"due_date"`
}

// AddRFQItemRequest represents the request to add an item to an RFQ
type AddRFQItemRequest struct {
	ItemName      string  `json:"item_name" binding:"required"`
	Description   string  `json:"description"`
	Specification string  `json:"specification"`
	Quantity      int     `json:"quantity" binding:"required,gt=0"`
	Unit          string  `json:"unit"`
	TargetPrice   float64 `json:"target_price"`
}

// UpdateRFQItemRequest represents the request to update an RFQ item
type UpdateRFQItemRequest struct {
	ItemName      string  `json:"item_name"`
	Description   string  `json:"description"`
	Specification string  `json:"specification"`
	Quantity      int     `json:"quantity"`
	Unit          string  `json:"unit"`
	TargetPrice   float64 `json:"target_price"`
}

// InviteSupplierRequest represents the request to invite a supplier to an RFQ
type InviteSupplierRequest struct {
	SupplierID string `json:"supplier_id" binding:"required"`
}

// SubmitResponseRequest represents a supplier's response to an RFQ
type SubmitResponseRequest struct {
	SupplierID      string                     `json:"supplier_id" binding:"required"`
	TotalAmount     float64                    `json:"total_amount" binding:"required"`
	Currency        string                     `json:"currency"`
	DeliveryTime    int                        `json:"delivery_time"`
	ValidityPeriod  int                        `json:"validity_period"`
	TermsConditions string                     `json:"terms_conditions"`
	Notes           string                     `json:"notes"`
	Items           []*ResponseItemRequest     `json:"items"`
}

// ResponseItemRequest represents detailed pricing for each RFQ item in the response
type ResponseItemRequest struct {
	RFQItemID    string  `json:"rfq_item_id" binding:"required"`
	UnitPrice    float64 `json:"unit_price" binding:"required"`
	TotalPrice   float64 `json:"total_price" binding:"required"`
	DeliveryTime int     `json:"delivery_time"`
	Notes        string  `json:"notes"`
}

// RejectResponseRequest represents the request to reject an RFQ response
type RejectResponseRequest struct {
	Reason string `json:"reason" binding:"required"`
}

// ConvertResponseToPORequest represents the request to convert an accepted response to PO
type ConvertResponseToPORequest struct {
	DeliveryAddress string `json:"delivery_address" binding:"required"`
	PaymentTerms    string `json:"payment_terms" binding:"required"`
}

// RFQResponse represents the RFQ response DTO
type RFQResponse struct {
	ID          string                 `json:"id"`
	RFQNumber   string                 `json:"rfq_number"`
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	Status      string                 `json:"status"`
	Priority    string                 `json:"priority"`
	CreatedBy   string                 `json:"created_by"`
	DueDate     *time.Time             `json:"due_date,omitempty"`
	PublishedAt *time.Time             `json:"published_at,omitempty"`
	ClosedAt    *time.Time             `json:"closed_at,omitempty"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
	Items       []*RFQItemResponse     `json:"items,omitempty"`
	Suppliers   []*RFQSupplierResponse `json:"suppliers,omitempty"`
	Responses   []*RFQResponseDetail   `json:"responses,omitempty"`
}

// RFQItemResponse represents an RFQ item response DTO
type RFQItemResponse struct {
	ID            string    `json:"id"`
	RFQID         string    `json:"rfq_id"`
	ItemName      string    `json:"item_name"`
	Description   string    `json:"description"`
	Specification string    `json:"specification"`
	Quantity      int       `json:"quantity"`
	Unit          string    `json:"unit"`
	TargetPrice   float64   `json:"target_price"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// RFQSupplierResponse represents an RFQ supplier response DTO
type RFQSupplierResponse struct {
	ID           string     `json:"id"`
	RFQID        string     `json:"rfq_id"`
	SupplierID   string     `json:"supplier_id"`
	SupplierName string     `json:"supplier_name,omitempty"`
	InvitedAt    time.Time  `json:"invited_at"`
	RespondedAt  *time.Time `json:"responded_at,omitempty"`
	Status       string     `json:"status"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// RFQResponseDetail represents a supplier's response to an RFQ DTO
type RFQResponseDetail struct {
	ID              string                   `json:"id"`
	RFQID           string                   `json:"rfq_id"`
	SupplierID      string                   `json:"supplier_id"`
	SupplierName    string                   `json:"supplier_name,omitempty"`
	ResponseDate    time.Time                `json:"response_date"`
	TotalAmount     float64                  `json:"total_amount"`
	Currency        string                   `json:"currency"`
	DeliveryTime    int                      `json:"delivery_time"`
	ValidityPeriod  int                      `json:"validity_period"`
	TermsConditions string                   `json:"terms_conditions"`
	Notes           string                   `json:"notes"`
	Status          string                   `json:"status"`
	CreatedAt       time.Time                `json:"created_at"`
	UpdatedAt       time.Time                `json:"updated_at"`
	Items           []*RFQResponseItemDetail `json:"items,omitempty"`
}

// RFQResponseItemDetail represents detailed pricing for each RFQ item DTO
type RFQResponseItemDetail struct {
	ID            string    `json:"id"`
	RFQResponseID string    `json:"rfq_response_id"`
	RFQItemID     string    `json:"rfq_item_id"`
	UnitPrice     float64   `json:"unit_price"`
	TotalPrice    float64   `json:"total_price"`
	DeliveryTime  int       `json:"delivery_time"`
	Notes         string    `json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// RFQListResponse represents the paginated list response for RFQs
type RFQListResponse struct {
	Data       []*RFQResponse `json:"data"`
	Pagination Pagination     `json:"pagination"`
}

// ToRFQResponse converts an RFQ entity to response DTO
func ToRFQResponse(rfq *entities.RFQ) *RFQResponse {
	if rfq == nil {
		return nil
	}

	response := &RFQResponse{
		ID:          rfq.ID,
		RFQNumber:   rfq.RFQNumber,
		Title:       rfq.Title,
		Description: rfq.Description,
		Status:      rfq.Status,
		Priority:    rfq.Priority,
		CreatedBy:   rfq.CreatedBy,
		DueDate:     rfq.DueDate,
		PublishedAt: rfq.PublishedAt,
		ClosedAt:    rfq.ClosedAt,
		CreatedAt:   rfq.CreatedAt,
		UpdatedAt:   rfq.UpdatedAt,
	}

	// Convert items
	if rfq.Items != nil {
		response.Items = make([]*RFQItemResponse, len(rfq.Items))
		for i, item := range rfq.Items {
			response.Items[i] = &RFQItemResponse{
				ID:            item.ID,
				RFQID:         item.RFQID,
				ItemName:      item.ItemName,
				Description:   item.Description,
				Specification: item.Specification,
				Quantity:      item.Quantity,
				Unit:          item.Unit,
				TargetPrice:   item.TargetPrice,
				CreatedAt:     item.CreatedAt,
				UpdatedAt:     item.UpdatedAt,
			}
		}
	}

	// Convert suppliers
	if rfq.Suppliers != nil {
		response.Suppliers = make([]*RFQSupplierResponse, len(rfq.Suppliers))
		for i, supplier := range rfq.Suppliers {
			response.Suppliers[i] = &RFQSupplierResponse{
				ID:           supplier.ID,
				RFQID:        supplier.RFQID,
				SupplierID:   supplier.SupplierID,
				SupplierName: supplier.SupplierName,
				InvitedAt:    supplier.InvitedAt,
				RespondedAt:  supplier.RespondedAt,
				Status:       supplier.Status,
				CreatedAt:    supplier.CreatedAt,
				UpdatedAt:    supplier.UpdatedAt,
			}
		}
	}

	// Convert responses
	if rfq.Responses != nil {
		response.Responses = make([]*RFQResponseDetail, len(rfq.Responses))
		for i, resp := range rfq.Responses {
			response.Responses[i] = ToRFQResponseDetail(resp)
		}
	}

	return response
}

// ToRFQResponseDetail converts an RFQResponse entity to DTO
func ToRFQResponseDetail(resp *entities.RFQResponse) *RFQResponseDetail {
	if resp == nil {
		return nil
	}

	detail := &RFQResponseDetail{
		ID:              resp.ID,
		RFQID:           resp.RFQID,
		SupplierID:      resp.SupplierID,
		SupplierName:    resp.SupplierName,
		ResponseDate:    resp.ResponseDate,
		TotalAmount:     resp.TotalAmount,
		Currency:        resp.Currency,
		DeliveryTime:    resp.DeliveryTime,
		ValidityPeriod:  resp.ValidityPeriod,
		TermsConditions: resp.TermsConditions,
		Notes:           resp.Notes,
		Status:          resp.Status,
		CreatedAt:       resp.CreatedAt,
		UpdatedAt:       resp.UpdatedAt,
	}

	// Convert response items
	if resp.ResponseItems != nil {
		detail.Items = make([]*RFQResponseItemDetail, len(resp.ResponseItems))
		for i, item := range resp.ResponseItems {
			detail.Items[i] = &RFQResponseItemDetail{
				ID:            item.ID,
				RFQResponseID: item.RFQResponseID,
				RFQItemID:     item.RFQItemID,
				UnitPrice:     item.UnitPrice,
				TotalPrice:    item.TotalPrice,
				DeliveryTime:  item.DeliveryTime,
				Notes:         item.Notes,
				CreatedAt:     item.CreatedAt,
				UpdatedAt:     item.UpdatedAt,
			}
		}
	}

	return detail
}

// ToRFQEntity converts CreateRFQRequest to RFQ entity
func (r *CreateRFQRequest) ToEntity() *entities.RFQ {
	rfq := entities.NewRFQ(r.Title, r.Description, r.CreatedBy, r.Priority)
	rfq.DueDate = r.DueDate

	// Convert items
	if r.Items != nil {
		rfq.Items = make([]*entities.RFQItem, len(r.Items))
		for i, itemReq := range r.Items {
			item := entities.NewRFQItem("", itemReq.ItemName, itemReq.Quantity, itemReq.Unit)
			item.Description = itemReq.Description
			item.Specification = itemReq.Specification
			item.TargetPrice = itemReq.TargetPrice
			rfq.Items[i] = item
		}
	}

	// Convert supplier IDs to RFQSupplier entities
	if r.SupplierIDs != nil {
		rfq.Suppliers = make([]*entities.RFQSupplier, len(r.SupplierIDs))
		for i, supplierID := range r.SupplierIDs {
			rfq.Suppliers[i] = entities.NewRFQSupplier("", supplierID)
		}
	}

	return rfq
}

// ToEntity converts SubmitResponseRequest to RFQResponse entity
func (r *SubmitResponseRequest) ToEntity(rfqID string) *entities.RFQResponse {
	response := entities.NewRFQResponse(rfqID, r.SupplierID, r.TotalAmount, r.Currency)
	response.DeliveryTime = r.DeliveryTime
	response.ValidityPeriod = r.ValidityPeriod
	response.TermsConditions = r.TermsConditions
	response.Notes = r.Notes

	// Convert items
	if r.Items != nil {
		response.ResponseItems = make([]*entities.RFQResponseItem, len(r.Items))
		for i, itemReq := range r.Items {
			item := entities.NewRFQResponseItem("", itemReq.RFQItemID, itemReq.UnitPrice, itemReq.TotalPrice)
			item.DeliveryTime = itemReq.DeliveryTime
			item.Notes = itemReq.Notes
			response.ResponseItems[i] = item
		}
	}

	return response
}
