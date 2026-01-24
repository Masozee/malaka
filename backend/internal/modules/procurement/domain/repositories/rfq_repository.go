package repositories

import (
	"context"

	"malaka/internal/modules/procurement/domain/entities"
)

// RFQFilter represents filter options for RFQ queries
type RFQFilter struct {
	Search    string `json:"search"`
	Status    string `json:"status"`
	Priority  string `json:"priority"`
	CreatedBy string `json:"created_by"`
	SortBy    string `json:"sortBy"`
	SortOrder string `json:"sortOrder"`
	Page      int    `json:"page"`
	Limit     int    `json:"limit"`
}

// RFQRepository defines the contract for RFQ data operations
type RFQRepository interface {
	// RFQ CRUD operations
	Create(ctx context.Context, rfq *entities.RFQ) error
	GetByID(ctx context.Context, id string) (*entities.RFQ, error)
	GetAll(ctx context.Context, filter *RFQFilter) ([]*entities.RFQ, int64, error)
	Update(ctx context.Context, rfq *entities.RFQ) error
	Delete(ctx context.Context, id string) error

	// RFQ specific operations
	GetByRFQNumber(ctx context.Context, rfqNumber string) (*entities.RFQ, error)
	PublishRFQ(ctx context.Context, id string) error
	CloseRFQ(ctx context.Context, id string) error
	CancelRFQ(ctx context.Context, id string) error
	GenerateRFQNumber(ctx context.Context) (string, error)

	// RFQ Item operations
	CreateItem(ctx context.Context, item *entities.RFQItem) error
	GetRFQItems(ctx context.Context, rfqID string) ([]*entities.RFQItem, error)
	UpdateItem(ctx context.Context, item *entities.RFQItem) error
	DeleteItem(ctx context.Context, id string) error

	// RFQ Supplier operations
	InviteSupplier(ctx context.Context, rfqSupplier *entities.RFQSupplier) error
	GetRFQSuppliers(ctx context.Context, rfqID string) ([]*entities.RFQSupplier, error)
	RemoveSupplier(ctx context.Context, rfqID, supplierID string) error
	UpdateSupplierStatus(ctx context.Context, rfqID, supplierID, status string) error

	// RFQ Response operations
	CreateResponse(ctx context.Context, response *entities.RFQResponse) error
	GetRFQResponses(ctx context.Context, rfqID string) ([]*entities.RFQResponse, error)
	GetResponseBySupplier(ctx context.Context, rfqID, supplierID string) (*entities.RFQResponse, error)
	GetResponseByID(ctx context.Context, id string) (*entities.RFQResponse, error)
	UpdateResponse(ctx context.Context, response *entities.RFQResponse) error
	AcceptResponse(ctx context.Context, responseID string) error
	RejectResponse(ctx context.Context, responseID, reason string) error

	// RFQ Response Item operations
	CreateResponseItem(ctx context.Context, item *entities.RFQResponseItem) error
	GetResponseItems(ctx context.Context, responseID string) ([]*entities.RFQResponseItem, error)

	// Statistics and analytics
	GetRFQStats(ctx context.Context) (map[string]interface{}, error)
}
