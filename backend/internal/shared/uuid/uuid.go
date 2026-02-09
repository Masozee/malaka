package uuid

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
)

// ID represents a UUID identifier using UUID v7 (time-ordered).
// UUID v7 provides better database performance than UUID v4:
// - Time-ordered: Sequential inserts improve B-tree index locality
// - Sortable: Natural chronological ordering by creation time
// - Same size: 16 bytes, compatible with existing UUID columns
type ID uuid.UUID

// Nil represents a nil UUID (all zeros)
var Nil = ID(uuid.Nil)

// New generates a new UUID v7 (time-ordered).
// UUID v7 provides better B-tree performance than random UUID v4.
func New() ID {
	return ID(uuid.Must(uuid.NewV7()))
}

// NewString generates a new UUID v7 and returns it as a string.
func NewString() string {
	return uuid.Must(uuid.NewV7()).String()
}

// Parse parses a UUID string into an ID.
func Parse(s string) (ID, error) {
	u, err := uuid.Parse(s)
	if err != nil {
		return Nil, fmt.Errorf("invalid UUID: %w", err)
	}
	return ID(u), nil
}

// MustParse parses a UUID string into an ID, panicking on error.
func MustParse(s string) ID {
	return ID(uuid.MustParse(s))
}

// FromUUID converts a google/uuid.UUID to ID.
func FromUUID(u uuid.UUID) ID {
	return ID(u)
}

// IsNil returns true if the ID is nil (all zeros).
func (id ID) IsNil() bool {
	return uuid.UUID(id) == uuid.Nil
}

// String returns the string representation of the UUID.
func (id ID) String() string {
	return uuid.UUID(id).String()
}

// UUID returns the underlying google/uuid.UUID.
func (id ID) UUID() uuid.UUID {
	return uuid.UUID(id)
}

// MarshalJSON implements json.Marshaler.
func (id ID) MarshalJSON() ([]byte, error) {
	return json.Marshal(uuid.UUID(id).String())
}

// UnmarshalJSON implements json.Unmarshaler.
func (id *ID) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	if s == "" {
		*id = Nil
		return nil
	}
	u, err := uuid.Parse(s)
	if err != nil {
		return fmt.Errorf("invalid UUID: %w", err)
	}
	*id = ID(u)
	return nil
}

// Value implements driver.Valuer for database operations.
func (id ID) Value() (driver.Value, error) {
	if id.IsNil() {
		return nil, nil
	}
	return uuid.UUID(id).String(), nil
}

// Scan implements sql.Scanner for database operations.
func (id *ID) Scan(src interface{}) error {
	if src == nil {
		*id = Nil
		return nil
	}

	switch v := src.(type) {
	case string:
		if v == "" {
			*id = Nil
			return nil
		}
		u, err := uuid.Parse(v)
		if err != nil {
			return fmt.Errorf("invalid UUID string: %w", err)
		}
		*id = ID(u)
	case []byte:
		if len(v) == 0 {
			*id = Nil
			return nil
		}
		// Try parsing as string first
		u, err := uuid.ParseBytes(v)
		if err != nil {
			// Try as raw 16 bytes
			if len(v) == 16 {
				copy((*id)[:], v)
				return nil
			}
			return fmt.Errorf("invalid UUID bytes: %w", err)
		}
		*id = ID(u)
	default:
		return fmt.Errorf("unsupported type for UUID: %T", src)
	}
	return nil
}

// NullableID represents a nullable UUID.
type NullableID struct {
	ID    ID
	Valid bool
}

// NewNullableID creates a new valid NullableID.
func NewNullableID(id ID) NullableID {
	return NullableID{ID: id, Valid: true}
}

// NullID returns an invalid (null) NullableID.
func NullID() NullableID {
	return NullableID{Valid: false}
}

// NullableIDFromString creates a NullableID from a string.
// Empty string results in an invalid (null) NullableID.
func NullableIDFromString(s string) (NullableID, error) {
	if s == "" {
		return NullID(), nil
	}
	id, err := Parse(s)
	if err != nil {
		return NullableID{}, err
	}
	return NewNullableID(id), nil
}

// Value implements driver.Valuer.
func (n NullableID) Value() (driver.Value, error) {
	if !n.Valid {
		return nil, nil
	}
	return n.ID.Value()
}

// Scan implements sql.Scanner.
func (n *NullableID) Scan(src interface{}) error {
	if src == nil {
		n.Valid = false
		n.ID = Nil
		return nil
	}
	n.Valid = true
	return n.ID.Scan(src)
}

// MarshalJSON implements json.Marshaler.
func (n NullableID) MarshalJSON() ([]byte, error) {
	if !n.Valid {
		return []byte("null"), nil
	}
	return n.ID.MarshalJSON()
}

// UnmarshalJSON implements json.Unmarshaler.
func (n *NullableID) UnmarshalJSON(data []byte) error {
	if string(data) == "null" || string(data) == `""` {
		n.Valid = false
		n.ID = Nil
		return nil
	}
	n.Valid = true
	return n.ID.UnmarshalJSON(data)
}

// String returns the string representation or empty string if null.
func (n NullableID) String() string {
	if !n.Valid {
		return ""
	}
	return n.ID.String()
}

// StringPtr returns a pointer to the string representation or nil if null.
func (n NullableID) StringPtr() *string {
	if !n.Valid {
		return nil
	}
	s := n.ID.String()
	return &s
}
