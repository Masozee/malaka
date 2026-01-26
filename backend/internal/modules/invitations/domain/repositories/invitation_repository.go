package repositories

import (
	"context"

	"malaka/internal/modules/invitations/domain/entities"
)

// InvitationRepository defines the interface for invitation data operations
type InvitationRepository interface {
	// Create creates a new invitation
	Create(ctx context.Context, invitation *entities.Invitation) error

	// GetByID retrieves an invitation by its ID
	GetByID(ctx context.Context, id string) (*entities.Invitation, error)

	// GetByToken retrieves an invitation by its token
	GetByToken(ctx context.Context, token string) (*entities.Invitation, error)

	// GetByEmail retrieves invitations by email
	GetByEmail(ctx context.Context, email string) ([]*entities.Invitation, error)

	// GetByInviter retrieves invitations sent by a specific user
	GetByInviter(ctx context.Context, invitedBy string) ([]*entities.Invitation, error)

	// GetByCompany retrieves invitations for a specific company
	GetByCompany(ctx context.Context, companyID string) ([]*entities.Invitation, error)

	// GetPendingByEmail retrieves pending invitations for an email
	GetPendingByEmail(ctx context.Context, email string) (*entities.Invitation, error)

	// Update updates an invitation
	Update(ctx context.Context, invitation *entities.Invitation) error

	// UpdateStatus updates the status of an invitation
	UpdateStatus(ctx context.Context, id string, status entities.InvitationStatus) error

	// MarkAsAccepted marks an invitation as accepted and links to created user
	MarkAsAccepted(ctx context.Context, id string, userID string) error

	// Delete deletes an invitation
	Delete(ctx context.Context, id string) error

	// ExpireOldInvitations marks expired invitations
	ExpireOldInvitations(ctx context.Context) (int64, error)

	// List retrieves all invitations with optional filters
	List(ctx context.Context, filters map[string]interface{}, limit, offset int) ([]*entities.Invitation, int64, error)
}
