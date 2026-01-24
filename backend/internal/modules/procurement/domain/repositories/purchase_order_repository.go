package repositories

import (
	"context"

	"malaka/internal/modules/procurement/domain/entities"
)

// PurchaseOrderFilter contains filter options for purchase order queries
type PurchaseOrderFilter struct {
	Search        string
	Status        string
	PaymentStatus string
	SupplierID    string
	StartDate     string
	EndDate       string
	Page          int
	Limit         int
	SortBy        string
	SortOrder     string
}

// PurchaseOrderListResult contains the result of a paginated purchase order query
type PurchaseOrderListResult struct {
	Data       []*entities.PurchaseOrder
	TotalRows  int64
	Page       int
	Limit      int
	TotalPages int
}

// PurchaseOrderStats contains statistics for purchase orders
type PurchaseOrderStats struct {
	TotalOrders     int64   `json:"total_orders"`
	DraftOrders     int64   `json:"draft_orders"`
	SentOrders      int64   `json:"sent_orders"`
	ConfirmedOrders int64   `json:"confirmed_orders"`
	ReceivedOrders  int64   `json:"received_orders"`
	CancelledOrders int64   `json:"cancelled_orders"`
	TotalValue      float64 `json:"total_value"`
	UnpaidValue     float64 `json:"unpaid_value"`
}

// PurchaseOrderRepository defines the interface for purchase order data access
type PurchaseOrderRepository interface {
	// Create creates a new purchase order
	Create(ctx context.Context, order *entities.PurchaseOrder) error

	// GetByID retrieves a purchase order by ID
	GetByID(ctx context.Context, id string) (*entities.PurchaseOrder, error)

	// GetByPONumber retrieves a purchase order by PO number
	GetByPONumber(ctx context.Context, poNumber string) (*entities.PurchaseOrder, error)

	// GetAll retrieves all purchase orders with optional filtering
	GetAll(ctx context.Context, filter PurchaseOrderFilter) (*PurchaseOrderListResult, error)

	// Update updates an existing purchase order
	Update(ctx context.Context, order *entities.PurchaseOrder) error

	// Delete deletes a purchase order
	Delete(ctx context.Context, id string) error

	// GetStats retrieves purchase order statistics
	GetStats(ctx context.Context) (*PurchaseOrderStats, error)

	// AddItem adds an item to a purchase order
	AddItem(ctx context.Context, item *entities.PurchaseOrderItem) error

	// UpdateItem updates an item in a purchase order
	UpdateItem(ctx context.Context, item *entities.PurchaseOrderItem) error

	// DeleteItem deletes an item from a purchase order
	DeleteItem(ctx context.Context, orderID, itemID string) error

	// GetItemsByOrderID retrieves all items for a purchase order
	GetItemsByOrderID(ctx context.Context, orderID string) ([]*entities.PurchaseOrderItem, error)

	// GetNextPONumber generates the next PO number
	GetNextPONumber(ctx context.Context) (string, error)
}
