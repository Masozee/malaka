package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// PosTransaction represents a Point of Sale transaction entity.
type PosTransaction struct {
	types.BaseModel
	TransactionDate  time.Time `json:"transaction_date" db:"transaction_date"`
	TotalAmount      float64   `json:"total_amount" db:"total_amount"`
	PaymentMethod    string    `json:"payment_method" db:"payment_method"`
	CashierID        uuid.ID   `json:"cashier_id" db:"cashier_id"`
	SalesPerson      string    `json:"sales_person,omitempty" db:"sales_person"`
	CustomerName     string    `json:"customer_name,omitempty" db:"customer_name"`
	CustomerPhone    string    `json:"customer_phone,omitempty" db:"customer_phone"`
	CustomerAddress  string    `json:"customer_address,omitempty" db:"customer_address"`
	VisitType        string    `json:"visit_type,omitempty" db:"visit_type"`
	Location         string    `json:"location,omitempty" db:"location"`
	Subtotal         float64   `json:"subtotal,omitempty" db:"subtotal"`
	TaxAmount        float64   `json:"tax_amount,omitempty" db:"tax_amount"`
	DiscountAmount   float64   `json:"discount_amount,omitempty" db:"discount_amount"`
	PaymentStatus    string    `json:"payment_status,omitempty" db:"payment_status"`
	DeliveryMethod   string    `json:"delivery_method,omitempty" db:"delivery_method"`
	DeliveryStatus   string    `json:"delivery_status,omitempty" db:"delivery_status"`
	CommissionRate   float64   `json:"commission_rate,omitempty" db:"commission_rate"`
	CommissionAmount float64   `json:"commission_amount,omitempty" db:"commission_amount"`
	Notes            string    `json:"notes,omitempty" db:"notes"`
}
