package repositories

import (
	"context"

	"malaka/internal/modules/procurement/domain/entities"
)

// PurchaseRequestFilter defines filter options for listing purchase requests.
type PurchaseRequestFilter struct {
	Search      string
	Status      string
	Priority    string
	Department  string
	RequesterID string
	Page        int
	Limit       int
	SortBy      string
	SortOrder   string
}

// PurchaseRequestRepository defines the interface for purchase request data operations.
type PurchaseRequestRepository interface {
	Create(ctx context.Context, pr *entities.PurchaseRequest) error
	GetByID(ctx context.Context, id string) (*entities.PurchaseRequest, error)
	GetAll(ctx context.Context, filter *PurchaseRequestFilter) ([]*entities.PurchaseRequest, int, error)
	Update(ctx context.Context, pr *entities.PurchaseRequest) error
	Delete(ctx context.Context, id string) error

	// Item operations
	CreateItem(ctx context.Context, item *entities.PurchaseRequestItem) error
	GetItemsByRequestID(ctx context.Context, requestID string) ([]*entities.PurchaseRequestItem, error)
	UpdateItem(ctx context.Context, item *entities.PurchaseRequestItem) error
	DeleteItem(ctx context.Context, id string) error
	DeleteItemsByRequestID(ctx context.Context, requestID string) error

	// Statistics
	GetStats(ctx context.Context) (*PurchaseRequestStats, error)

	// Number generation
	GetNextRequestNumber(ctx context.Context) (string, error)
}

// PurchaseRequestStats holds statistics for purchase requests.
type PurchaseRequestStats struct {
	Total       int     `json:"total"`
	Draft       int     `json:"draft"`
	Pending     int     `json:"pending"`
	Approved    int     `json:"approved"`
	Rejected    int     `json:"rejected"`
	TotalAmount float64 `json:"total_amount"`
}
