package audit

import (
	"bytes"
	"context"
	"io"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	"malaka/internal/shared/auth"
)

// Middleware logs all successful write operations (POST/PUT/DELETE) to the audit_log table.
// It runs after the handler and only records 2xx responses.
func Middleware(db *sqlx.DB) gin.HandlerFunc {
	repo := NewRepository(db)

	return func(c *gin.Context) {
		method := c.Request.Method

		// Only intercept write methods
		if method != "POST" && method != "PUT" && method != "DELETE" && method != "PATCH" {
			c.Next()
			return
		}

		// Capture request body before handler reads it
		var body []byte
		if c.Request.Body != nil {
			body, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(body))
		}

		// Run the handler
		c.Next()

		// Only log successful mutations (2xx)
		status := c.Writer.Status()
		if status < 200 || status >= 300 {
			return
		}

		// Extract user ID from context (set by auth middleware)
		userID := auth.GetUserID(c)
		if userID == "" {
			return
		}

		// Parse module/resource/action from URL path
		module, resource, action := parseRoute(method, c.Request.URL.Path)

		// Skip logging for certain paths (e.g., login, health checks)
		if module == "" || module == "auth" {
			return
		}

		// Cap request body at 10KB and sanitize sensitive fields
		bodyStr := sanitizeBody(body, 10240)

		// Insert async to avoid slowing down the response
		entry := &AuditLogEntry{
			UserID:     &userID,
			Method:     method,
			Path:       c.Request.URL.Path,
			Module:     module,
			Resource:   resource,
			Action:     action,
			StatusCode: status,
			IPAddress:  c.ClientIP(),
			UserAgent:  truncateString(c.Request.UserAgent(), 500),
		}
		if bodyStr != "" {
			entry.RequestBody = &bodyStr
		}

		go func() {
			ctx := context.Background()
			_ = repo.Insert(ctx, entry)
		}()
	}
}

// parseRoute extracts module, resource, and action from a URL path.
// Example: /api/v1/masterdata/articles/123 → module="masterdata", resource="articles", action="update"
func parseRoute(method, path string) (module, resource, action string) {
	// Remove query string
	if idx := strings.Index(path, "?"); idx != -1 {
		path = path[:idx]
	}

	// Split path: /api/v1/{module}/{resource}/...
	parts := strings.Split(strings.Trim(path, "/"), "/")

	// Expected: ["api", "v1", "{module}", "{resource}", ...]
	if len(parts) < 4 {
		return "", "", ""
	}

	// Skip "api" and "v1"
	if parts[0] == "api" && parts[1] == "v1" {
		module = parts[2]
		if len(parts) > 3 {
			resource = parts[3]
		}
	} else {
		return "", "", ""
	}

	// Map HTTP method to action
	switch method {
	case "POST":
		action = "create"
	case "PUT", "PATCH":
		action = "update"
	case "DELETE":
		action = "delete"
	default:
		action = method
	}

	return module, resource, action
}

// sanitizeBody truncates the body to maxLen and removes sensitive fields.
func sanitizeBody(body []byte, maxLen int) string {
	if len(body) == 0 {
		return ""
	}

	s := string(body)

	// Truncate if too long
	if len(s) > maxLen {
		s = s[:maxLen]
	}

	// Don't store bodies that look like they contain passwords
	lower := strings.ToLower(s)
	if strings.Contains(lower, "password") || strings.Contains(lower, "secret") || strings.Contains(lower, "token") {
		return `{"_redacted": true}`
	}

	return s
}

// truncateString truncates a string to maxLen.
func truncateString(s string, maxLen int) string {
	if len(s) > maxLen {
		return s[:maxLen]
	}
	return s
}
