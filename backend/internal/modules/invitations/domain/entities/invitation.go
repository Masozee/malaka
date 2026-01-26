package entities

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// JSONMetadata is a custom type for metadata that handles JSON serialization
type JSONMetadata map[string]interface{}

// Scan implements the sql.Scanner interface
func (j *JSONMetadata) Scan(value interface{}) error {
	if value == nil {
		*j = make(map[string]interface{})
		return nil
	}

	var data []byte
	switch v := value.(type) {
	case []byte:
		data = v
	case string:
		data = []byte(v)
	default:
		*j = make(map[string]interface{})
		return nil
	}

	if len(data) == 0 {
		*j = make(map[string]interface{})
		return nil
	}

	return json.Unmarshal(data, j)
}

// Value implements the driver.Valuer interface
func (j JSONMetadata) Value() (driver.Value, error) {
	if j == nil {
		return []byte("{}"), nil
	}
	return json.Marshal(j)
}

// InvitationStatus represents the status of an invitation
type InvitationStatus string

const (
	InvitationStatusPending  InvitationStatus = "pending"
	InvitationStatusAccepted InvitationStatus = "accepted"
	InvitationStatusExpired  InvitationStatus = "expired"
	InvitationStatusRevoked  InvitationStatus = "revoked"
)

// Invitation represents a user registration invitation
type Invitation struct {
	ID            string            `json:"id" db:"id"`
	Email         string            `json:"email" db:"email"`
	Token         string            `json:"token,omitempty" db:"token"`
	Role          string            `json:"role" db:"role"`
	CompanyID     string            `json:"company_id" db:"company_id"`
	InvitedBy     string            `json:"invited_by" db:"invited_by"`
	InvitedByName string            `json:"invited_by_name,omitempty" db:"invited_by_name"`
	Status        InvitationStatus  `json:"status" db:"status"`
	ExpiresAt     time.Time         `json:"expires_at" db:"expires_at"`
	AcceptedAt    *time.Time        `json:"accepted_at,omitempty" db:"accepted_at"`
	CreatedUserID *string           `json:"created_user_id,omitempty" db:"created_user_id"`
	Metadata      JSONMetadata `json:"metadata,omitempty" db:"metadata"`
	CreatedAt     time.Time         `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at" db:"updated_at"`

	// Joined fields
	CompanyName string `json:"company_name,omitempty" db:"company_name"`
}

// IsExpired checks if the invitation has expired
func (i *Invitation) IsExpired() bool {
	return time.Now().After(i.ExpiresAt)
}

// IsValid checks if the invitation can be used
func (i *Invitation) IsValid() bool {
	return i.Status == InvitationStatusPending && !i.IsExpired()
}

// CreateInvitationRequest represents a request to create an invitation
type CreateInvitationRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Role      string `json:"role" binding:"required"`
	CompanyID string `json:"company_id" binding:"required"`
	Message   string `json:"message,omitempty"`
}

// AcceptInvitationRequest represents a request to accept an invitation
type AcceptInvitationRequest struct {
	Token    string `json:"token" binding:"required"`
	FullName string `json:"full_name" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
	Phone    string `json:"phone,omitempty"`
}

// InvitationResponse represents the response for an invitation
type InvitationResponse struct {
	ID          string           `json:"id"`
	Email       string           `json:"email"`
	Role        string           `json:"role"`
	CompanyName string           `json:"company_name"`
	InviterName string           `json:"inviter_name"`
	Status      InvitationStatus `json:"status"`
	ExpiresAt   time.Time        `json:"expires_at"`
	CreatedAt   time.Time        `json:"created_at"`
}

// ValidateInvitationResponse represents response when validating an invitation token
type ValidateInvitationResponse struct {
	Valid       bool   `json:"valid"`
	Email       string `json:"email,omitempty"`
	Role        string `json:"role,omitempty"`
	CompanyName string `json:"company_name,omitempty"`
	InviterName string `json:"inviter_name,omitempty"`
	ExpiresAt   string `json:"expires_at,omitempty"`
	Error       string `json:"error,omitempty"`
}

// InvitationValidation represents internal validation result
type InvitationValidation struct {
	Valid     bool      `json:"valid"`
	Email     string    `json:"email,omitempty"`
	Role      string    `json:"role,omitempty"`
	CompanyID string    `json:"company_id,omitempty"`
	ExpiresAt time.Time `json:"expires_at,omitempty"`
	Message   string    `json:"message,omitempty"`
}
