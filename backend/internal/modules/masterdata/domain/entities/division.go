package entities

import (
	"time"

	"github.com/google/uuid"
)

// Division represents a business division or group.
type Division struct {
	ID          uuid.UUID `db:"id" json:"id"`
	Code        string    `db:"code" json:"code"`
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	ParentID    *uuid.UUID `db:"parent_id" json:"parent_id"`
	Level       int       `db:"level" json:"level"`
	SortOrder   int       `db:"sort_order" json:"sort_order"`
	Status      string    `db:"status" json:"status"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}