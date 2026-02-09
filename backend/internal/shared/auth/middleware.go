package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// Middleware is a Gin middleware for authentication.
// Returns proper JSON error responses for authentication failures.
func Middleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization header is required",
				"code":    "UNAUTHORIZED",
			})
			return
		}

		// Extract token from "Bearer <token>" format
		const bearerPrefix = "Bearer "
		if !strings.HasPrefix(authHeader, bearerPrefix) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid authorization header format",
				"code":    "UNAUTHORIZED",
			})
			return
		}

		token := strings.TrimPrefix(authHeader, bearerPrefix)
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Token is required",
				"code":    "UNAUTHORIZED",
			})
			return
		}

		claims, err := ParseJWT(token, secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid or expired token",
				"code":    "UNAUTHORIZED",
			})
			return
		}

		// Set user info in context for downstream handlers
		c.Set("user_id", claims.Subject)
		c.Set("user_role", claims.Role)
		c.Set("company_id", claims.CompanyID)
		c.Set("user_email", claims.Email)
		c.Next()
	}
}

// OptionalMiddleware is a middleware that extracts user info if present but doesn't require auth.
// Useful for endpoints that work differently for authenticated vs anonymous users.
func OptionalMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		const bearerPrefix = "Bearer "
		if !strings.HasPrefix(authHeader, bearerPrefix) {
			c.Next()
			return
		}

		token := strings.TrimPrefix(authHeader, bearerPrefix)
		claims, err := ParseJWT(token, secret)
		if err != nil {
			// Token invalid, but optional - continue without user context
			c.Next()
			return
		}

		c.Set("user_id", claims.Subject)
		c.Set("user_role", claims.Role)
		c.Next()
	}
}

// RoleMiddleware checks if the authenticated user has the required role.
// Must be used after Middleware().
func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Access denied",
				"code":    "FORBIDDEN",
			})
			return
		}

		userRole, ok := role.(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Invalid user role",
				"code":    "FORBIDDEN",
			})
			return
		}

		for _, allowed := range allowedRoles {
			if userRole == allowed {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Insufficient permissions",
			"code":    "FORBIDDEN",
		})
	}
}

// GetUserID extracts user ID from context. Returns empty string if not authenticated.
func GetUserID(c *gin.Context) string {
	userID, _ := c.Get("user_id")
	if id, ok := userID.(string); ok {
		return id
	}
	return ""
}

// GetUserRole extracts user role from context. Returns empty string if not set.
func GetUserRole(c *gin.Context) string {
	role, _ := c.Get("user_role")
	if r, ok := role.(string); ok {
		return r
	}
	return ""
}
