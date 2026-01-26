package persistence

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"malaka/internal/modules/invitations/domain/entities"
	"malaka/internal/modules/invitations/domain/repositories"

	"github.com/jmoiron/sqlx"
)

type invitationRepository struct {
	db *sqlx.DB
}

// NewInvitationRepository creates a new invitation repository
func NewInvitationRepository(db *sqlx.DB) repositories.InvitationRepository {
	return &invitationRepository{db: db}
}

// Create creates a new invitation
func (r *invitationRepository) Create(ctx context.Context, invitation *entities.Invitation) error {
	query := `
		INSERT INTO invitations (
			id, email, token, role, company_id, invited_by, status,
			expires_at, metadata, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
		)
	`

	// Serialize metadata to JSON
	metadataJSON := []byte("{}")
	if invitation.Metadata != nil {
		var err error
		metadataJSON, err = json.Marshal(invitation.Metadata)
		if err != nil {
			return fmt.Errorf("failed to serialize metadata: %w", err)
		}
	}

	_, err := r.db.ExecContext(ctx, query,
		invitation.ID,
		invitation.Email,
		invitation.Token,
		invitation.Role,
		invitation.CompanyID,
		invitation.InvitedBy,
		invitation.Status,
		invitation.ExpiresAt,
		metadataJSON,
		invitation.CreatedAt,
		invitation.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create invitation: %w", err)
	}

	return nil
}

// GetByID retrieves an invitation by its ID
func (r *invitationRepository) GetByID(ctx context.Context, id string) (*entities.Invitation, error) {
	query := `
		SELECT
			id, email, token, role, company_id, invited_by, status,
			expires_at, accepted_at, created_user_id,
			COALESCE(metadata::text, '{}') as metadata,
			created_at, updated_at
		FROM invitations
		WHERE id = $1
	`

	var invitation entities.Invitation
	err := r.db.GetContext(ctx, &invitation, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get invitation by id: %w", err)
	}

	return &invitation, nil
}

// GetByToken retrieves an invitation by its token
func (r *invitationRepository) GetByToken(ctx context.Context, token string) (*entities.Invitation, error) {
	query := `
		SELECT
			id, email, token, role, company_id, invited_by, status,
			expires_at, accepted_at, created_user_id,
			COALESCE(metadata::text, '{}') as metadata,
			created_at, updated_at
		FROM invitations
		WHERE token = $1
	`

	var invitation entities.Invitation
	err := r.db.GetContext(ctx, &invitation, query, token)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get invitation by token: %w", err)
	}

	return &invitation, nil
}

// GetByEmail retrieves invitations by email
func (r *invitationRepository) GetByEmail(ctx context.Context, email string) ([]*entities.Invitation, error) {
	query := `
		SELECT
			id, email, token, role, company_id, invited_by, status,
			expires_at, accepted_at, created_user_id,
			COALESCE(metadata::text, '{}') as metadata,
			created_at, updated_at
		FROM invitations
		WHERE email = $1
		ORDER BY created_at DESC
	`

	var invitations []*entities.Invitation
	err := r.db.SelectContext(ctx, &invitations, query, email)
	if err != nil {
		return nil, fmt.Errorf("failed to get invitations by email: %w", err)
	}

	return invitations, nil
}

// GetByInviter retrieves invitations sent by a specific user
func (r *invitationRepository) GetByInviter(ctx context.Context, invitedBy string) ([]*entities.Invitation, error) {
	query := `
		SELECT
			id, email, token, role, company_id, invited_by, status,
			expires_at, accepted_at, created_user_id,
			COALESCE(metadata::text, '{}') as metadata,
			created_at, updated_at
		FROM invitations
		WHERE invited_by = $1
		ORDER BY created_at DESC
	`

	var invitations []*entities.Invitation
	err := r.db.SelectContext(ctx, &invitations, query, invitedBy)
	if err != nil {
		return nil, fmt.Errorf("failed to get invitations by inviter: %w", err)
	}

	return invitations, nil
}

// GetByCompany retrieves invitations for a specific company
func (r *invitationRepository) GetByCompany(ctx context.Context, companyID string) ([]*entities.Invitation, error) {
	query := `
		SELECT
			id, email, token, role, company_id, invited_by, status,
			expires_at, accepted_at, created_user_id,
			COALESCE(metadata::text, '{}') as metadata,
			created_at, updated_at
		FROM invitations
		WHERE company_id = $1
		ORDER BY created_at DESC
	`

	var invitations []*entities.Invitation
	err := r.db.SelectContext(ctx, &invitations, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get invitations by company: %w", err)
	}

	return invitations, nil
}

// GetPendingByEmail retrieves pending invitation for an email
func (r *invitationRepository) GetPendingByEmail(ctx context.Context, email string) (*entities.Invitation, error) {
	query := `
		SELECT
			id, email, token, role, company_id, invited_by, status,
			expires_at, accepted_at, created_user_id,
			COALESCE(metadata::text, '{}') as metadata,
			created_at, updated_at
		FROM invitations
		WHERE email = $1 AND status = 'pending' AND expires_at > NOW()
		ORDER BY created_at DESC
		LIMIT 1
	`

	var invitation entities.Invitation
	err := r.db.GetContext(ctx, &invitation, query, email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get pending invitation by email: %w", err)
	}

	return &invitation, nil
}

// Update updates an invitation
func (r *invitationRepository) Update(ctx context.Context, invitation *entities.Invitation) error {
	query := `
		UPDATE invitations SET
			email = $2,
			role = $3,
			status = $4,
			expires_at = $5,
			accepted_at = $6,
			created_user_id = $7,
			metadata = $8,
			updated_at = $9
		WHERE id = $1
	`

	// Serialize metadata to JSON
	metadataJSON := []byte("{}")
	if invitation.Metadata != nil {
		var err error
		metadataJSON, err = json.Marshal(invitation.Metadata)
		if err != nil {
			return fmt.Errorf("failed to serialize metadata: %w", err)
		}
	}

	_, err := r.db.ExecContext(ctx, query,
		invitation.ID,
		invitation.Email,
		invitation.Role,
		invitation.Status,
		invitation.ExpiresAt,
		invitation.AcceptedAt,
		invitation.CreatedUserID,
		metadataJSON,
		time.Now(),
	)

	if err != nil {
		return fmt.Errorf("failed to update invitation: %w", err)
	}

	return nil
}

// UpdateStatus updates the status of an invitation
func (r *invitationRepository) UpdateStatus(ctx context.Context, id string, status entities.InvitationStatus) error {
	query := `
		UPDATE invitations SET
			status = $2,
			updated_at = NOW()
		WHERE id = $1
	`

	_, err := r.db.ExecContext(ctx, query, id, status)
	if err != nil {
		return fmt.Errorf("failed to update invitation status: %w", err)
	}

	return nil
}

// MarkAsAccepted marks an invitation as accepted and links to created user
func (r *invitationRepository) MarkAsAccepted(ctx context.Context, id string, userID string) error {
	query := `
		UPDATE invitations SET
			status = 'accepted',
			accepted_at = NOW(),
			created_user_id = $2,
			updated_at = NOW()
		WHERE id = $1
	`

	_, err := r.db.ExecContext(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to mark invitation as accepted: %w", err)
	}

	return nil
}

// Delete deletes an invitation
func (r *invitationRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM invitations WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete invitation: %w", err)
	}

	return nil
}

// ExpireOldInvitations marks expired invitations
func (r *invitationRepository) ExpireOldInvitations(ctx context.Context) (int64, error) {
	query := `
		UPDATE invitations SET
			status = 'expired',
			updated_at = NOW()
		WHERE status = 'pending' AND expires_at < NOW()
	`

	result, err := r.db.ExecContext(ctx, query)
	if err != nil {
		return 0, fmt.Errorf("failed to expire old invitations: %w", err)
	}

	count, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get affected rows: %w", err)
	}

	return count, nil
}

// List retrieves all invitations with optional filters
func (r *invitationRepository) List(ctx context.Context, filters map[string]interface{}, limit, offset int) ([]*entities.Invitation, int64, error) {
	baseQuery := `
		SELECT
			id, email, token, role, company_id, invited_by, status,
			expires_at, accepted_at, created_user_id,
			COALESCE(metadata::text, '{}') as metadata,
			created_at, updated_at
		FROM invitations
		WHERE 1=1
	`

	countQuery := `SELECT COUNT(*) FROM invitations WHERE 1=1`

	args := []interface{}{}
	argIndex := 1

	// Apply filters
	if status, ok := filters["status"].(string); ok && status != "" {
		baseQuery += fmt.Sprintf(" AND status = $%d", argIndex)
		countQuery += fmt.Sprintf(" AND status = $%d", argIndex)
		args = append(args, status)
		argIndex++
	}

	if companyID, ok := filters["company_id"].(string); ok && companyID != "" {
		baseQuery += fmt.Sprintf(" AND company_id = $%d", argIndex)
		countQuery += fmt.Sprintf(" AND company_id = $%d", argIndex)
		args = append(args, companyID)
		argIndex++
	}

	if email, ok := filters["email"].(string); ok && email != "" {
		baseQuery += fmt.Sprintf(" AND email ILIKE $%d", argIndex)
		countQuery += fmt.Sprintf(" AND email ILIKE $%d", argIndex)
		args = append(args, "%"+email+"%")
		argIndex++
	}

	// Get total count
	var total int64
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count invitations: %w", err)
	}

	// Add ordering and pagination
	baseQuery += " ORDER BY created_at DESC"
	baseQuery += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, limit, offset)

	var invitations []*entities.Invitation
	err = r.db.SelectContext(ctx, &invitations, baseQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list invitations: %w", err)
	}

	return invitations, total, nil
}
