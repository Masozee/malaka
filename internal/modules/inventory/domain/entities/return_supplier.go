package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// ReturnSupplier represents a return to supplier entity.
type ReturnSupplier struct {
	types.BaseModel
	SupplierID string    `json:"supplier_id"`
	ReturnDate time.Time `json:"return_date"`
	Reason     string    `json:"reason"`
}
