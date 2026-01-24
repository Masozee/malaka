package entities

import (
	"time"

	"github.com/google/uuid"

	"malaka/internal/shared/types"
	"malaka/internal/shared/utils"
)

// RFQ represents a Request for Quotation entity in the procurement module
type RFQ struct {
	types.BaseModel
	RFQNumber   string     `json:"rfq_number" db:"rfq_number"`
	Title       string     `json:"title" db:"title"`
	Description string     `json:"description" db:"description"`
	Status      string     `json:"status" db:"status"`     // draft, published, closed, cancelled
	Priority    string     `json:"priority" db:"priority"` // low, medium, high, urgent
	CreatedBy   string     `json:"created_by" db:"created_by"`
	DueDate     *time.Time `json:"due_date,omitempty" db:"due_date"`
	PublishedAt *time.Time `json:"published_at,omitempty" db:"published_at"`
	ClosedAt    *time.Time `json:"closed_at,omitempty" db:"closed_at"`

	// Related data populated by repository
	Items     []*RFQItem     `json:"items,omitempty"`
	Suppliers []*RFQSupplier `json:"suppliers,omitempty"`
	Responses []*RFQResponse `json:"responses,omitempty"`
}

// NewRFQ creates a new RFQ with default values
func NewRFQ(title, description, createdBy, priority string) *RFQ {
	now := utils.Now()
	return &RFQ{
		BaseModel: types.BaseModel{
			ID:        uuid.New().String(),
			CreatedAt: now,
			UpdatedAt: now,
		},
		Title:       title,
		Description: description,
		Status:      "draft",
		Priority:    priority,
		CreatedBy:   createdBy,
	}
}

// RFQItem represents an item in an RFQ
type RFQItem struct {
	types.BaseModel
	RFQID         string  `json:"rfq_id" db:"rfq_id"`
	ItemName      string  `json:"item_name" db:"item_name"`
	Description   string  `json:"description" db:"description"`
	Specification string  `json:"specification" db:"specification"`
	Quantity      int     `json:"quantity" db:"quantity"`
	Unit          string  `json:"unit" db:"unit"`
	TargetPrice   float64 `json:"target_price" db:"target_price"`
}

// NewRFQItem creates a new RFQ item
func NewRFQItem(rfqID, itemName string, quantity int, unit string) *RFQItem {
	now := utils.Now()
	return &RFQItem{
		BaseModel: types.BaseModel{
			ID:        uuid.New().String(),
			CreatedAt: now,
			UpdatedAt: now,
		},
		RFQID:    rfqID,
		ItemName: itemName,
		Quantity: quantity,
		Unit:     unit,
	}
}

// RFQSupplier represents a supplier invited to an RFQ
type RFQSupplier struct {
	types.BaseModel
	RFQID       string     `json:"rfq_id" db:"rfq_id"`
	SupplierID  string     `json:"supplier_id" db:"supplier_id"`
	InvitedAt   time.Time  `json:"invited_at" db:"invited_at"`
	RespondedAt *time.Time `json:"responded_at,omitempty" db:"responded_at"`
	Status      string     `json:"status" db:"status"` // invited, responded, declined

	// Related supplier data
	SupplierName string `json:"supplier_name,omitempty" db:"supplier_name"`
}

// NewRFQSupplier creates a new RFQ supplier invitation
func NewRFQSupplier(rfqID, supplierID string) *RFQSupplier {
	now := utils.Now()
	return &RFQSupplier{
		BaseModel: types.BaseModel{
			ID:        uuid.New().String(),
			CreatedAt: now,
			UpdatedAt: now,
		},
		RFQID:      rfqID,
		SupplierID: supplierID,
		InvitedAt:  now,
		Status:     "invited",
	}
}

// RFQResponse represents a supplier's response to an RFQ
type RFQResponse struct {
	types.BaseModel
	RFQID           string    `json:"rfq_id" db:"rfq_id"`
	SupplierID      string    `json:"supplier_id" db:"supplier_id"`
	ResponseDate    time.Time `json:"response_date" db:"response_date"`
	TotalAmount     float64   `json:"total_amount" db:"total_amount"`
	Currency        string    `json:"currency" db:"currency"`
	DeliveryTime    int       `json:"delivery_time" db:"delivery_time"`       // days
	ValidityPeriod  int       `json:"validity_period" db:"validity_period"`   // days
	TermsConditions string    `json:"terms_conditions" db:"terms_conditions"`
	Notes           string    `json:"notes" db:"notes"`
	Status          string    `json:"status" db:"status"` // submitted, under_review, accepted, rejected

	// Related data
	SupplierName  string             `json:"supplier_name,omitempty" db:"supplier_name"`
	ResponseItems []*RFQResponseItem `json:"response_items,omitempty"`
}

// NewRFQResponse creates a new RFQ response
func NewRFQResponse(rfqID, supplierID string, totalAmount float64, currency string) *RFQResponse {
	now := utils.Now()
	return &RFQResponse{
		BaseModel: types.BaseModel{
			ID:        uuid.New().String(),
			CreatedAt: now,
			UpdatedAt: now,
		},
		RFQID:        rfqID,
		SupplierID:   supplierID,
		ResponseDate: now,
		TotalAmount:  totalAmount,
		Currency:     currency,
		Status:       "submitted",
	}
}

// RFQResponseItem represents detailed pricing for each RFQ item
type RFQResponseItem struct {
	types.BaseModel
	RFQResponseID string  `json:"rfq_response_id" db:"rfq_response_id"`
	RFQItemID     string  `json:"rfq_item_id" db:"rfq_item_id"`
	UnitPrice     float64 `json:"unit_price" db:"unit_price"`
	TotalPrice    float64 `json:"total_price" db:"total_price"`
	DeliveryTime  int     `json:"delivery_time" db:"delivery_time"` // days for this specific item
	Notes         string  `json:"notes" db:"notes"`

	// Related data
	RFQItem *RFQItem `json:"rfq_item,omitempty"`
}

// NewRFQResponseItem creates a new RFQ response item
func NewRFQResponseItem(responseID, itemID string, unitPrice, totalPrice float64) *RFQResponseItem {
	now := utils.Now()
	return &RFQResponseItem{
		BaseModel: types.BaseModel{
			ID:        uuid.New().String(),
			CreatedAt: now,
			UpdatedAt: now,
		},
		RFQResponseID: responseID,
		RFQItemID:     itemID,
		UnitPrice:     unitPrice,
		TotalPrice:    totalPrice,
	}
}
