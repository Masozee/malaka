package types

import (
	"time"

	"malaka/internal/shared/uuid"
)

// BaseModel provides common fields for all models.
// Uses UUID v7 (time-ordered) for better database performance.
type BaseModel struct {
	ID        uuid.ID   `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// NewBaseModel creates a new BaseModel with a generated UUID v7.
func NewBaseModel() BaseModel {
	now := time.Now()
	return BaseModel{
		ID:        uuid.New(),
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// GetID returns the ID as a string for backward compatibility.
func (b BaseModel) GetID() string {
	return b.ID.String()
}

// SetID sets the ID from a string for backward compatibility.
func (b *BaseModel) SetID(id string) error {
	parsed, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	b.ID = parsed
	return nil
}

// BaseModelLegacy provides backward compatibility for entities
// that still use string IDs during migration.
// Deprecated: Use BaseModel with uuid.ID instead.
type BaseModelLegacy struct {
	ID        string    `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
