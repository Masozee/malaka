package entities

import (
	"time"

	"github.com/google/uuid"
)

type CourierRate struct {
	ID          uuid.UUID `db:"id" json:"id"`
	CourierID   uuid.UUID `db:"courier_id" json:"courier_id"`
	Origin      string    `db:"origin" json:"origin"`
	Destination string    `db:"destination" json:"destination"`
	Price       float64   `db:"price" json:"price"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}
