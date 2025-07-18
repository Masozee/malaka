package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RBAC is a Gin middleware for role-based access control.
func RBAC(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// In a real application, you would get the user's roles from the database.
		// For now, we'll just assume the user has the "admin" role.
		userRoles := []string{"admin"}

		for _, role := range roles {
			for _, userRole := range userRoles {
				if role == userRole {
					c.Next()
					return
				}
			}
		}

		c.AbortWithStatus(http.StatusForbidden)
	}
}
