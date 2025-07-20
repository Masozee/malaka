package entities

import (
	"time"

	"github.com/google/uuid"
)

// Depstore represents a department store entity.
type Depstore struct {
	ID           uuid.UUID `db:"id" json:"id"`
	Name         string    `db:"name" json:"name"`
	Code         string    `db:"code" json:"code"`
	Address      string    `db:"address" json:"address"`
	Contact      string    `db:"contact" json:"contact"`
	PaymentTerms int       `db:"payment_terms" json:"payment_terms"` // Days for payment terms
	IsActive     bool      `db:"is_active" json:"is_active"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"`
}