package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// PurchaseOrder represents a purchase order entity.
type PurchaseOrder struct {
	types.BaseModel
	SupplierID   string    `json:"supplier_id"`
	OrderDate    time.Time `json:"order_date"`
	Status       string    `json:"status"`
	TotalAmount  float64   `json:"total_amount"`
	
	// Related data for API responses
	Supplier     *Supplier            `json:"supplier,omitempty"`
	Items        []*PurchaseOrderItem `json:"items,omitempty"`
}

// Supplier represents basic supplier information for purchase orders
type Supplier struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Code         string `json:"code"`
	ContactPerson string `json:"contact_person"`
	Phone        string `json:"phone"`
	Email        string `json:"email"`
	Address      string `json:"address"`
}

// PurchaseOrderItem represents an item in a purchase order
type PurchaseOrderItem struct {
	types.BaseModel
	PurchaseOrderID  string   `json:"purchase_order_id"`
	ArticleID        string   `json:"article_id"`
	Quantity         int      `json:"quantity"`
	UnitPrice        float64  `json:"unit_price"`
	TotalPrice       float64  `json:"total_price"`
	
	// Related data for API responses
	Article          *Article `json:"article,omitempty"`
}

// Article represents basic article information for purchase order items
type Article struct {
	ID           string `json:"id"`
	Code         string `json:"code"`
	Name         string `json:"name"`
	Description  string `json:"description"`
}
