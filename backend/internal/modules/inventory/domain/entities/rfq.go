package entities

import (
	"time"
	"malaka/internal/shared/types"
)

// DEPRECATED: RFQ in the Inventory module is deprecated.
// All RFQ operations should use the Procurement module's RFQ entity.
// RFQ (Request for Quotation) is a procurement function, not an inventory function.
//
// Migration path:
// 1. Use malaka/internal/modules/procurement/domain/entities.RFQ instead
// 2. All RFQ-related routes should be under /api/v1/procurement/rfqs
// 3. This entity will be removed in a future version
//
// See: malaka/internal/modules/procurement/domain/entities/rfq.go
//
// RFQ represents a Request for Quotation entity
type RFQ struct {
	types.BaseModel
	RFQNumber   string     `json:"rfq_number"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`      // draft, published, closed, cancelled
	Priority    string     `json:"priority"`    // low, medium, high, urgent
	CreatedBy   string     `json:"created_by"`
	DueDate     *time.Time `json:"due_date"`
	PublishedAt *time.Time `json:"published_at"`
	ClosedAt    *time.Time `json:"closed_at"`
	
	// Related data populated by repository
	Items     []*RFQItem     `json:"items,omitempty"`
	Suppliers []*RFQSupplier `json:"suppliers,omitempty"`
	Responses []*RFQResponse `json:"responses,omitempty"`
}

// RFQItem represents an item in an RFQ
type RFQItem struct {
	types.BaseModel
	RFQID         string  `json:"rfq_id"`
	ItemName      string  `json:"item_name"`
	Description   string  `json:"description"`
	Specification string  `json:"specification"`
	Quantity      int     `json:"quantity"`
	Unit          string  `json:"unit"`
	TargetPrice   float64 `json:"target_price"`
}

// RFQSupplier represents a supplier invited to an RFQ
type RFQSupplier struct {
	types.BaseModel
	RFQID       string     `json:"rfq_id"`
	SupplierID  string     `json:"supplier_id"`
	InvitedAt   time.Time  `json:"invited_at"`
	RespondedAt *time.Time `json:"responded_at"`
	Status      string     `json:"status"` // invited, responded, declined
	
	// Related supplier data
	Supplier *Supplier `json:"supplier,omitempty"`
}

// RFQResponse represents a supplier's response to an RFQ
type RFQResponse struct {
	types.BaseModel
	RFQID           string  `json:"rfq_id"`
	SupplierID      string  `json:"supplier_id"`
	ResponseDate    time.Time `json:"response_date"`
	TotalAmount     float64 `json:"total_amount"`
	Currency        string  `json:"currency"`
	DeliveryTime    int     `json:"delivery_time"`    // days
	ValidityPeriod  int     `json:"validity_period"`  // days
	TermsConditions string  `json:"terms_conditions"`
	Notes           string  `json:"notes"`
	Status          string  `json:"status"` // submitted, under_review, accepted, rejected
	
	// Related data
	Supplier      *Supplier            `json:"supplier,omitempty"`
	ResponseItems []*RFQResponseItem   `json:"response_items,omitempty"`
}

// RFQResponseItem represents detailed pricing for each RFQ item
type RFQResponseItem struct {
	types.BaseModel
	RFQResponseID string  `json:"rfq_response_id"`
	RFQItemID     string  `json:"rfq_item_id"`
	UnitPrice     float64 `json:"unit_price"`
	TotalPrice    float64 `json:"total_price"`
	DeliveryTime  int     `json:"delivery_time"` // days for this specific item
	Notes         string  `json:"notes"`
	
	// Related data
	RFQItem *RFQItem `json:"rfq_item,omitempty"`
}

