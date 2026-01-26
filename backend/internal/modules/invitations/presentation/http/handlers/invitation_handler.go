package handlers

import (
	"net/http"
	"strconv"

	"malaka/internal/modules/invitations/domain/entities"
	"malaka/internal/modules/invitations/domain/services"
	"malaka/internal/shared/response"

	"github.com/gin-gonic/gin"
)

// InvitationHandler handles HTTP requests for invitations
type InvitationHandler struct {
	service *services.InvitationService
}

// NewInvitationHandler creates a new invitation handler
func NewInvitationHandler(service *services.InvitationService) *InvitationHandler {
	return &InvitationHandler{service: service}
}

// CreateInvitation handles POST /api/v1/invitations
func (h *InvitationHandler) CreateInvitation(c *gin.Context) {
	var req entities.CreateInvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Get inviter ID from JWT context
	inviterID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	invitation, err := h.service.CreateInvitation(c.Request.Context(), &req, inviterID.(string))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to create invitation", err.Error())
		return
	}

	// Don't expose the token in the response for security
	invitation.Token = ""

	response.Success(c, http.StatusCreated, "Invitation sent successfully", invitation)
}

// ValidateInvitation handles GET /api/v1/invitations/validate/:token
func (h *InvitationHandler) ValidateInvitation(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		response.Error(c, http.StatusBadRequest, "Token is required", nil)
		return
	}

	validation, err := h.service.ValidateInvitation(c.Request.Context(), token)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to validate invitation", err.Error())
		return
	}

	// Get additional details if valid
	if validation.Valid {
		invitation, err := h.service.GetInvitationByToken(c.Request.Context(), token)
		if err == nil && invitation != nil {
			resp := entities.ValidateInvitationResponse{
				Valid:       true,
				Email:       invitation.Email,
				Role:        invitation.Role,
				CompanyName: invitation.CompanyName,
				InviterName: invitation.InvitedByName,
				ExpiresAt:   invitation.ExpiresAt.Format("2006-01-02 15:04:05"),
			}
			response.Success(c, http.StatusOK, "Invitation is valid", resp)
			return
		}
	}

	resp := entities.ValidateInvitationResponse{
		Valid: validation.Valid,
		Error: validation.Message,
	}

	if !validation.Valid {
		response.Error(c, http.StatusBadRequest, validation.Message, resp)
		return
	}

	response.Success(c, http.StatusOK, "Invitation is valid", resp)
}

// AcceptInvitation handles POST /api/v1/invitations/accept
func (h *InvitationHandler) AcceptInvitation(c *gin.Context) {
	var req entities.AcceptInvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	user, err := h.service.AcceptInvitation(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to accept invitation", err.Error())
		return
	}

	response.Success(c, http.StatusCreated, "Account created successfully", gin.H{
		"user": gin.H{
			"id":       user.ID,
			"email":    user.Email,
			"fullName": user.FullName,
			"role":     user.Role,
		},
	})
}

// GetInvitation handles GET /api/v1/invitations/:id
func (h *InvitationHandler) GetInvitation(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "Invitation ID is required", nil)
		return
	}

	invitation, err := h.service.GetInvitationByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get invitation", err.Error())
		return
	}
	if invitation == nil {
		response.Error(c, http.StatusNotFound, "Invitation not found", nil)
		return
	}

	// Don't expose the token
	invitation.Token = ""

	response.Success(c, http.StatusOK, "Invitation retrieved", invitation)
}

// ListInvitations handles GET /api/v1/invitations
func (h *InvitationHandler) ListInvitations(c *gin.Context) {
	// Parse query parameters
	limit := 20
	offset := 0

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	// Build filters
	filters := make(map[string]interface{})
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if companyID := c.Query("company_id"); companyID != "" {
		filters["company_id"] = companyID
	}
	if email := c.Query("email"); email != "" {
		filters["email"] = email
	}

	invitations, total, err := h.service.ListInvitations(c.Request.Context(), filters, limit, offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to list invitations", err.Error())
		return
	}

	// Don't expose tokens
	for _, inv := range invitations {
		inv.Token = ""
	}

	response.Success(c, http.StatusOK, "Invitations retrieved", gin.H{
		"invitations": invitations,
		"total":       total,
		"limit":       limit,
		"offset":      offset,
	})
}

// RevokeInvitation handles POST /api/v1/invitations/:id/revoke
func (h *InvitationHandler) RevokeInvitation(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "Invitation ID is required", nil)
		return
	}

	err := h.service.RevokeInvitation(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to revoke invitation", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Invitation revoked", nil)
}

// ResendInvitation handles POST /api/v1/invitations/:id/resend
func (h *InvitationHandler) ResendInvitation(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "Invitation ID is required", nil)
		return
	}

	// Get inviter ID from JWT context
	inviterID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	err := h.service.ResendInvitation(c.Request.Context(), id, inviterID.(string))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to resend invitation", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Invitation resent", nil)
}

// DeleteInvitation handles DELETE /api/v1/invitations/:id
func (h *InvitationHandler) DeleteInvitation(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "Invitation ID is required", nil)
		return
	}

	err := h.service.DeleteInvitation(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete invitation", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Invitation deleted", nil)
}
