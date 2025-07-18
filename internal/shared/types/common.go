package types

import (
	"time"
)

// BaseModel provides common fields for all models.
type BaseModel struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
