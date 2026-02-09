package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

type CourierRate struct {
	ID          uuid.ID   `db:"id" json:"id"`
	CourierID   uuid.ID   `db:"courier_id" json:"courier_id"`
	Origin      string    `db:"origin" json:"origin"`
	Destination string    `db:"destination" json:"destination"`
	CompanyID   string    `db:"company_id" json:"company_id"`
	Price       float64   `db:"price" json:"price"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}
