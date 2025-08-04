package entities

import (
	"time"

	"github.com/google/uuid"
)

// Depstore represents a department store entity.
type Depstore struct {
	ID              uuid.UUID `db:"id" json:"id"`
	Code            string    `db:"code" json:"code"`
	Name            string    `db:"name" json:"name"`
	Address         string    `db:"address" json:"address"`
	City            string    `db:"city" json:"city"`
	Phone           string    `db:"phone" json:"phone"`
	ContactPerson   string    `db:"contact_person" json:"contact_person"`
	CommissionRate  float64   `db:"commission_rate" json:"commission_rate"`
	PaymentTerms    string    `db:"payment_terms" json:"payment_terms"`
	Status          string    `db:"status" json:"status"`
	CreatedAt       time.Time `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time `db:"updated_at" json:"updated_at"`
}