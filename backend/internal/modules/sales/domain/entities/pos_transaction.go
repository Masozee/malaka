package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// PosTransaction represents a Point of Sale transaction entity.
type PosTransaction struct {
	types.BaseModel
	TransactionDate  time.Time `json:"transaction_date"`
	TotalAmount      float64   `json:"total_amount"`
	PaymentMethod    string    `json:"payment_method"`
	CashierID        string    `json:"cashier_id"`
	SalesPerson      string    `json:"sales_person,omitempty"`
	CustomerName     string    `json:"customer_name,omitempty"`
	CustomerPhone    string    `json:"customer_phone,omitempty"`
	CustomerAddress  string    `json:"customer_address,omitempty"`
	VisitType        string    `json:"visit_type,omitempty"`
	Location         string    `json:"location,omitempty"`
	Subtotal         float64   `json:"subtotal,omitempty"`
	TaxAmount        float64   `json:"tax_amount,omitempty"`
	DiscountAmount   float64   `json:"discount_amount,omitempty"`
	PaymentStatus    string    `json:"payment_status,omitempty"`
	DeliveryMethod   string    `json:"delivery_method,omitempty"`
	DeliveryStatus   string    `json:"delivery_status,omitempty"`
	CommissionRate   float64   `json:"commission_rate,omitempty"`
	CommissionAmount float64   `json:"commission_amount,omitempty"`
	Notes            string    `json:"notes,omitempty"`
}
