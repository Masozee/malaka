package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// Division represents a business division or group.
type Division struct {
	ID          uuid.ID  `db:"id" json:"id"`
	Code        string   `db:"code" json:"code"`
	Name        string   `db:"name" json:"name"`
	Description string   `db:"description" json:"description"`
	ParentID    *uuid.ID `db:"parent_id" json:"parent_id"`
	Level       int      `db:"level" json:"level"`
	SortOrder   int      `db:"sort_order" json:"sort_order"`
	CompanyID   string   `db:"company_id" json:"company_id"`
	Status      string   `db:"status" json:"status"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}
