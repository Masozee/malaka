package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// PurchaseRequest represents a purchase request entity.
type PurchaseRequest struct {
	types.BaseModel
	RequestNumber   string                 `json:"request_number" db:"request_number"`
	Title           string                 `json:"title" db:"title"`
	Description     string                 `json:"description,omitempty" db:"description"`
	RequesterID     string                 `json:"requester_id" db:"requester_id"`
	Department      string                 `json:"department" db:"department"`
	Priority        string                 `json:"priority" db:"priority"`
	Status          string                 `json:"status" db:"status"`
	RequestedDate   time.Time              `json:"requested_date" db:"requested_date"`
	RequiredDate    *time.Time             `json:"required_date,omitempty" db:"required_date"`
	ApprovedBy      *string                `json:"approved_by,omitempty" db:"approved_by"`
	ApprovedDate    *time.Time             `json:"approved_date,omitempty" db:"approved_date"`
	RejectionReason *string                `json:"rejection_reason,omitempty" db:"rejection_reason"`
	TotalAmount     float64                `json:"total_amount" db:"total_amount"`
	Currency        string                 `json:"currency" db:"currency"`
	Notes           *string                `json:"notes,omitempty" db:"notes"`

	// Related data for API responses
	RequesterName string                  `json:"requester_name,omitempty" db:"requester_name"`
	Items         []*PurchaseRequestItem  `json:"items,omitempty"`
}

// PurchaseRequestItem represents an item in a purchase request.
type PurchaseRequestItem struct {
	types.BaseModel
	PurchaseRequestID string   `json:"purchase_request_id" db:"purchase_request_id"`
	ItemName          string   `json:"item_name" db:"item_name"`
	Description       *string  `json:"description,omitempty" db:"description"`
	Specification     *string  `json:"specification,omitempty" db:"specification"`
	Quantity          int      `json:"quantity" db:"quantity"`
	Unit              string   `json:"unit" db:"unit"`
	EstimatedPrice    float64  `json:"estimated_price" db:"estimated_price"`
	Currency          string   `json:"currency" db:"currency"`
	SupplierID        *string  `json:"supplier_id,omitempty" db:"supplier_id"`

	// Related data for API responses
	SupplierName *string `json:"supplier_name,omitempty" db:"supplier_name"`
}

// PurchaseRequestStatus constants
const (
	PRStatusDraft     = "draft"
	PRStatusPending   = "pending"
	PRStatusApproved  = "approved"
	PRStatusRejected  = "rejected"
	PRStatusCancelled = "cancelled"
)

// PurchaseRequestPriority constants
const (
	PRPriorityLow    = "low"
	PRPriorityMedium = "medium"
	PRPriorityHigh   = "high"
	PRPriorityUrgent = "urgent"
)

// IsValidStatus checks if the given status is valid.
func (pr *PurchaseRequest) IsValidStatus() bool {
	switch pr.Status {
	case PRStatusDraft, PRStatusPending, PRStatusApproved, PRStatusRejected, PRStatusCancelled:
		return true
	}
	return false
}

// CanBeApproved checks if the purchase request can be approved.
func (pr *PurchaseRequest) CanBeApproved() bool {
	return pr.Status == PRStatusPending
}

// CanBeRejected checks if the purchase request can be rejected.
func (pr *PurchaseRequest) CanBeRejected() bool {
	return pr.Status == PRStatusPending
}

// CanBeConverted checks if the purchase request can be converted to a PO.
func (pr *PurchaseRequest) CanBeConverted() bool {
	return pr.Status == PRStatusApproved
}

// CalculateTotalAmount calculates the total amount from items.
func (pr *PurchaseRequest) CalculateTotalAmount() {
	var total float64
	for _, item := range pr.Items {
		total += item.EstimatedPrice * float64(item.Quantity)
	}
	pr.TotalAmount = total
}
