package repositories

import (
	"context"
	"malaka/internal/modules/inventory/domain/entities"
)

// RFQRepository defines the contract for RFQ data operations
type RFQRepository interface {
	// RFQ CRUD operations
	Create(ctx context.Context, rfq *entities.RFQ) error
	GetByID(ctx context.Context, id string) (*entities.RFQ, error)
	GetAll(ctx context.Context) ([]*entities.RFQ, error)
	Update(ctx context.Context, rfq *entities.RFQ) error
	Delete(ctx context.Context, id string) error
	
	// RFQ specific operations
	GetByRFQNumber(ctx context.Context, rfqNumber string) (*entities.RFQ, error)
	GetByStatus(ctx context.Context, status string) ([]*entities.RFQ, error)
	GetByCreatedBy(ctx context.Context, createdBy string) ([]*entities.RFQ, error)
	PublishRFQ(ctx context.Context, id string) error
	CloseRFQ(ctx context.Context, id string) error
	
	// RFQ Item operations
	CreateItem(ctx context.Context, item *entities.RFQItem) error
	GetRFQItems(ctx context.Context, rfqID string) ([]*entities.RFQItem, error)
	UpdateItem(ctx context.Context, item *entities.RFQItem) error
	DeleteItem(ctx context.Context, id string) error
	
	// RFQ Supplier operations
	InviteSupplier(ctx context.Context, rfqSupplier *entities.RFQSupplier) error
	GetRFQSuppliers(ctx context.Context, rfqID string) ([]*entities.RFQSupplier, error)
	RemoveSupplier(ctx context.Context, rfqID, supplierID string) error
	
	// RFQ Response operations  
	CreateResponse(ctx context.Context, response *entities.RFQResponse) error
	GetRFQResponses(ctx context.Context, rfqID string) ([]*entities.RFQResponse, error)
	GetResponseBySupplier(ctx context.Context, rfqID, supplierID string) (*entities.RFQResponse, error)
	UpdateResponse(ctx context.Context, response *entities.RFQResponse) error
	
	// Statistics and analytics
	GetRFQStats(ctx context.Context) (map[string]interface{}, error)
}