package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// PosTransaction represents a Point of Sale transaction entity.
type PosTransaction struct {
	types.BaseModel
	TransactionDate time.Time `json:"transaction_date"`
	TotalAmount     float64   `json:"total_amount"`
	PaymentMethod   string    `json:"payment_method"`
	CashierID       string    `json:"cashier_id"`
}
