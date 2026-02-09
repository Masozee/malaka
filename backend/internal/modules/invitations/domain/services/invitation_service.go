package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"strconv"
	"time"

	"malaka/internal/modules/invitations/domain/entities"
	"malaka/internal/modules/invitations/domain/repositories"
	userEntities "malaka/internal/modules/masterdata/domain/entities"
	userRepositories "malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/email"
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"

	"golang.org/x/crypto/bcrypt"
)

// InvitationService handles invitation business logic
type InvitationService struct {
	invitationRepo repositories.InvitationRepository
	userRepo       userRepositories.UserRepository
	emailService   *email.EmailService
	frontendURL    string
	logoURL        string
	expiryHours    int
}

// NewInvitationService creates a new invitation service
func NewInvitationService(
	invitationRepo repositories.InvitationRepository,
	userRepo userRepositories.UserRepository,
	emailService *email.EmailService,
) *InvitationService {
	expiryHours := 72
	if h := os.Getenv("INVITATION_EXPIRY_HOURS"); h != "" {
		if parsed, err := strconv.Atoi(h); err == nil {
			expiryHours = parsed
		}
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	logoURL := os.Getenv("LOGO_URL")
	if logoURL == "" {
		// Default to frontend logo if LOGO_URL not set
		logoURL = frontendURL + "/logo.png"
	}

	return &InvitationService{
		invitationRepo: invitationRepo,
		userRepo:       userRepo,
		emailService:   emailService,
		frontendURL:    frontendURL,
		logoURL:        logoURL,
		expiryHours:    expiryHours,
	}
}

// generateToken generates a secure random token
func generateToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// CreateInvitation creates a new invitation and sends email
func (s *InvitationService) CreateInvitation(ctx context.Context, req *entities.CreateInvitationRequest, inviterID uuid.ID) (*entities.Invitation, error) {
	// Check if user already exists with this email
	existingUser, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing user: %w", err)
	}
	if existingUser != nil {
		return nil, fmt.Errorf("user with email %s already exists", req.Email)
	}

	// Check if there's already a pending invitation for this email
	pendingInvitation, err := s.invitationRepo.GetPendingByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to check pending invitation: %w", err)
	}
	if pendingInvitation != nil {
		return nil, fmt.Errorf("pending invitation already exists for email %s", req.Email)
	}

	// Generate secure token
	token, err := generateToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	// Get inviter details
	inviter, err := s.userRepo.GetByID(ctx, inviterID)
	if err != nil {
		return nil, fmt.Errorf("failed to get inviter details: %w", err)
	}

	// Parse company ID
	companyID, err := uuid.Parse(req.CompanyID)
	if err != nil {
		return nil, fmt.Errorf("invalid company ID: %w", err)
	}

	// Create invitation
	now := time.Now()
	invitation := &entities.Invitation{
		ID:        uuid.New(),
		Email:     req.Email,
		Token:     token,
		Role:      req.Role,
		CompanyID: companyID,
		InvitedBy: inviterID,
		Status:    entities.InvitationStatusPending,
		ExpiresAt: now.Add(time.Duration(s.expiryHours) * time.Hour),
		Metadata:  map[string]interface{}{"message": req.Message},
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Save to database
	if err := s.invitationRepo.Create(ctx, invitation); err != nil {
		return nil, fmt.Errorf("failed to create invitation: %w", err)
	}

	// Send invitation email
	invitationLink := fmt.Sprintf("%s/auth/signup?token=%s", s.frontendURL, token)

	inviterName := ""
	if inviter.FullName != nil {
		inviterName = *inviter.FullName
	}

	emailData := email.InvitationEmailData{
		InviterName:    inviterName,
		CompanyName:    "Malaka ERP", // Could be fetched from company if needed
		Role:           req.Role,
		InvitationLink: invitationLink,
		ExpiryHours:    s.expiryHours,
		LogoURL:        s.logoURL,
	}

	if err := s.emailService.SendInvitationEmail(req.Email, emailData); err != nil {
		// Log error but don't fail - invitation is already created
		fmt.Printf("Warning: failed to send invitation email to %s: %v\n", req.Email, err)
	}

	return invitation, nil
}

// GetInvitationByToken retrieves an invitation by token and validates it
func (s *InvitationService) GetInvitationByToken(ctx context.Context, token string) (*entities.Invitation, error) {
	invitation, err := s.invitationRepo.GetByToken(ctx, token)
	if err != nil {
		return nil, fmt.Errorf("failed to get invitation: %w", err)
	}
	if invitation == nil {
		return nil, fmt.Errorf("invitation not found")
	}

	return invitation, nil
}

// ValidateInvitation checks if an invitation is valid for acceptance
func (s *InvitationService) ValidateInvitation(ctx context.Context, token string) (*entities.InvitationValidation, error) {
	invitation, err := s.invitationRepo.GetByToken(ctx, token)
	if err != nil {
		return nil, fmt.Errorf("failed to get invitation: %w", err)
	}
	if invitation == nil {
		return &entities.InvitationValidation{
			Valid:   false,
			Message: "Invalid invitation link",
		}, nil
	}

	// Check if expired
	if time.Now().After(invitation.ExpiresAt) {
		// Update status to expired
		s.invitationRepo.UpdateStatus(ctx, invitation.ID, entities.InvitationStatusExpired)
		return &entities.InvitationValidation{
			Valid:   false,
			Message: "This invitation has expired",
		}, nil
	}

	// Check status
	if invitation.Status != entities.InvitationStatusPending {
		var message string
		switch invitation.Status {
		case entities.InvitationStatusAccepted:
			message = "This invitation has already been accepted"
		case entities.InvitationStatusExpired:
			message = "This invitation has expired"
		case entities.InvitationStatusRevoked:
			message = "This invitation has been revoked"
		default:
			message = "This invitation is no longer valid"
		}
		return &entities.InvitationValidation{
			Valid:   false,
			Message: message,
		}, nil
	}

	return &entities.InvitationValidation{
		Valid:     true,
		Email:     invitation.Email,
		Role:      invitation.Role,
		CompanyID: invitation.CompanyID,
		ExpiresAt: invitation.ExpiresAt,
		Message:   "Invitation is valid",
	}, nil
}

// AcceptInvitation accepts an invitation and creates the user
func (s *InvitationService) AcceptInvitation(ctx context.Context, req *entities.AcceptInvitationRequest) (*userEntities.User, error) {
	// Validate the invitation first
	validation, err := s.ValidateInvitation(ctx, req.Token)
	if err != nil {
		return nil, err
	}
	if !validation.Valid {
		return nil, fmt.Errorf(validation.Message)
	}

	// Get the invitation
	invitation, err := s.invitationRepo.GetByToken(ctx, req.Token)
	if err != nil {
		return nil, fmt.Errorf("failed to get invitation: %w", err)
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create the user
	now := time.Now()
	fullName := req.FullName
	phone := req.Phone

	user := &userEntities.User{
		BaseModel: types.BaseModel{
			ID:        uuid.New(),
			CreatedAt: now,
			UpdatedAt: now,
		},
		Email:     invitation.Email,
		Username:  invitation.Email, // Use email as username
		FullName:  &fullName,
		Password:  string(hashedPassword),
		Phone:     &phone,
		Role:      invitation.Role,
		CompanyID: invitation.CompanyID.String(),
		Status:    "active",
	}

	// Save user to database
	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Mark invitation as accepted
	userID := user.BaseModel.ID
	if err := s.invitationRepo.MarkAsAccepted(ctx, invitation.ID, userID); err != nil {
		// Log but don't fail - user is already created
		fmt.Printf("Warning: failed to mark invitation as accepted: %v\n", err)
	}

	// Clear password before returning
	user.Password = ""

	return user, nil
}

// GetInvitationByID retrieves an invitation by ID
func (s *InvitationService) GetInvitationByID(ctx context.Context, id uuid.ID) (*entities.Invitation, error) {
	return s.invitationRepo.GetByID(ctx, id)
}

// ListInvitations lists invitations with filters
func (s *InvitationService) ListInvitations(ctx context.Context, filters map[string]interface{}, limit, offset int) ([]*entities.Invitation, int64, error) {
	return s.invitationRepo.List(ctx, filters, limit, offset)
}

// GetInvitationsByCompany retrieves all invitations for a company
func (s *InvitationService) GetInvitationsByCompany(ctx context.Context, companyID uuid.ID) ([]*entities.Invitation, error) {
	return s.invitationRepo.GetByCompany(ctx, companyID)
}

// RevokeInvitation revokes a pending invitation
func (s *InvitationService) RevokeInvitation(ctx context.Context, id uuid.ID) error {
	invitation, err := s.invitationRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get invitation: %w", err)
	}
	if invitation == nil {
		return fmt.Errorf("invitation not found")
	}

	if invitation.Status != entities.InvitationStatusPending {
		return fmt.Errorf("can only revoke pending invitations")
	}

	return s.invitationRepo.UpdateStatus(ctx, id, entities.InvitationStatusRevoked)
}

// ResendInvitation resends the invitation email
func (s *InvitationService) ResendInvitation(ctx context.Context, id uuid.ID, inviterID uuid.ID) error {
	invitation, err := s.invitationRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get invitation: %w", err)
	}
	if invitation == nil {
		return fmt.Errorf("invitation not found")
	}

	if invitation.Status != entities.InvitationStatusPending {
		return fmt.Errorf("can only resend pending invitations")
	}

	// Get inviter details
	inviter, err := s.userRepo.GetByID(ctx, inviterID)
	if err != nil {
		return fmt.Errorf("failed to get inviter details: %w", err)
	}

	// Extend expiry
	newExpiry := time.Now().Add(time.Duration(s.expiryHours) * time.Hour)
	invitation.ExpiresAt = newExpiry
	invitation.UpdatedAt = time.Now()

	if err := s.invitationRepo.Update(ctx, invitation); err != nil {
		return fmt.Errorf("failed to update invitation: %w", err)
	}

	// Send invitation email
	invitationLink := fmt.Sprintf("%s/auth/signup?token=%s", s.frontendURL, invitation.Token)

	inviterName := ""
	if inviter.FullName != nil {
		inviterName = *inviter.FullName
	}

	emailData := email.InvitationEmailData{
		InviterName:    inviterName,
		CompanyName:    "Malaka ERP",
		Role:           invitation.Role,
		InvitationLink: invitationLink,
		ExpiryHours:    s.expiryHours,
		LogoURL:        s.logoURL,
	}

	return s.emailService.SendInvitationEmail(invitation.Email, emailData)
}

// DeleteInvitation deletes an invitation
func (s *InvitationService) DeleteInvitation(ctx context.Context, id uuid.ID) error {
	return s.invitationRepo.Delete(ctx, id)
}

// ExpireOldInvitations marks old invitations as expired
func (s *InvitationService) ExpireOldInvitations(ctx context.Context) (int64, error) {
	return s.invitationRepo.ExpireOldInvitations(ctx)
}
