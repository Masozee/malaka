package audit

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// Handler handles audit log API endpoints.
type Handler struct {
	repo *Repository
}

// NewHandler creates a new audit handler.
func NewHandler(db *sqlx.DB) *Handler {
	return &Handler{repo: NewRepository(db)}
}

// GetUserAuditLog returns audit log entries for a specific user.
func (h *Handler) GetUserAuditLog(c *gin.Context) {
	userID := c.Param("id")

	entries, err := h.repo.GetByUserID(c.Request.Context(), userID, 200, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to get user audit log", "error": err.Error()})
		return
	}

	if entries == nil {
		entries = []AuditLogEntry{}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": entries})
}

// GetAuditLog returns the system-wide audit log.
func (h *Handler) GetAuditLog(c *gin.Context) {
	entries, err := h.repo.GetAll(c.Request.Context(), 200, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to get audit log", "error": err.Error()})
		return
	}

	if entries == nil {
		entries = []AuditLogEntry{}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": entries})
}
